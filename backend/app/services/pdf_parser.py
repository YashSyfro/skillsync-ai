import fitz  # PyMuPDF


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Takes raw PDF bytes (from file upload), returns extracted plain text.

    Why bytes and not a file path?
    FastAPI gives us bytes from the upload directly. Accepting bytes means
    we never touch the filesystem — simpler, no temp file cleanup needed.

    Why PyMuPDF (fitz)?
    It handles multi-column layouts, embedded fonts, and complex PDFs much
    better than pdfminer or pypdf2. One library, reliable results.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    pages_text = []
    for page in doc:
        pages_text.append(page.get_text())

    doc.close()

    full_text = "\n".join(pages_text).strip()

    if not full_text:
        raise ValueError(
            "Could not extract text from this PDF. "
            "It may be a scanned image. Please use a text-based PDF."
        )

    return full_text
