from pydantic import BaseModel
from typing import Optional, Any


class ResumeUploadResponse(BaseModel):
    session_id: str
    filename: str
    char_count: int
    raw_text: str
    status: str = "success"


class AnalysisRequest(BaseModel):
    session_id: str
    resume_text: str
    job_description: str


class AnalysisResponse(BaseModel):
    session_id: str
    resume_skills: list[str]
    jd_skills: list[str]
    job_title: Optional[str] = None
    match_score: int
    matched_skills: list[str]
    missing_skills: list[str]
    recommended_skills: list[str]
    summary: str
    roadmap: Optional[Any] = None