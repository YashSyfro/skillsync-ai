import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import settings
from app.models.schemas import ResumeUploadResponse
from app.services.pdf_parser import extract_text_from_pdf

router = APIRouter(prefix="/api/resume", tags=["resume"])

ALLOWED_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts a PDF file, extracts its text, returns structured data.

    Why UploadFile and not bytes directly?
    UploadFile gives us the filename and content_type from the multipart
    headers, which we use for validation before reading the bytes.

    Why not save the file to disk?
    For Phase 1, we don't need persistence. We extract text and return it.
    The client stores session_id + raw_text in state. Phase 2 will add MongoDB.
    """

    # --- Validation ---
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Only PDF files are accepted. Got: {file.content_type}",
        )

    file_bytes = await file.read()

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB.",
        )

    # --- PDF parsing ---
    try:
        raw_text = extract_text_from_pdf(file_bytes)
    except ValueError as e:
        # Scanned/image PDFs raise ValueError from the parser
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

    # session_id ties the resume to a later analysis request.
    # Simple UUID — no DB needed in Phase 1.
    session_id = str(uuid.uuid4())

    return ResumeUploadResponse(
        session_id=session_id,
        filename=file.filename,
        char_count=len(raw_text),
        raw_text=raw_text,
    )
