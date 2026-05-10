from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import analysis, resume

app = FastAPI(
    title="SkillSync AI API",
    version="0.1.0",
    description="Resume and skill gap analyzer powered by LLMs",
)

# --- CORS ---
# Without this, the browser will block requests from localhost:5173 to localhost:8000.
# In production, FRONTEND_URL is set to your actual Vercel domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
# Each router handles its own prefix (/api/resume, /api/analysis).
# main.py stays clean — it just registers them.
app.include_router(resume.router)
app.include_router(analysis.router)


@app.get("/health")
def health_check():
    """
    Simple liveness check. Render and Railway ping this to confirm
    the service is up. Also useful during local dev to confirm the
    server started correctly before testing real endpoints.
    """
    return {"status": "ok", "version": "0.1.0"}
