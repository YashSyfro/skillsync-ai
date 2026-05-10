from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.models.schemas import AnalysisRequest
from app.services.llm_service import extract_skills, generate_roadmap, match_skills

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


def _safe_parse_roadmap(raw: dict):
    if not raw or not isinstance(raw, dict):
        return None
    weeks = raw.get("weeks", [])
    if not weeks:
        return None
    cleaned_weeks = []
    for w in weeks:
        if not isinstance(w, dict):
            continue
        cleaned_weeks.append({
            "week_label": str(w.get("week_label") or w.get("week") or "Week"),
            "focus_skills": w.get("focus_skills") or w.get("skills") or [],
            "goal": str(w.get("goal") or ""),
            "tasks": w.get("tasks") or [],
            "mini_project": str(w.get("mini_project") or w.get("project") or ""),
            "resources": [
                {
                    "title": str(r.get("title", "")),
                    "url": str(r.get("url", "#")),
                    "type": str(r.get("type", "docs")),
                }
                for r in (w.get("resources") or [])
                if isinstance(r, dict)
            ],
        })
    if not cleaned_weeks:
        return None
    projects = []
    for p in (raw.get("recommended_projects") or []):
        if not isinstance(p, dict):
            continue
        projects.append({
            "title": str(p.get("title", "")),
            "description": str(p.get("description", "")),
            "skills_used": p.get("skills_used") or [],
        })
    return {
        "weeks": cleaned_weeks,
        "priority_skills": raw.get("priority_skills") or [],
        "recommended_projects": projects,
        "summary": str(raw.get("summary") or ""),
    }


@router.post("/run")
async def run_analysis(body: AnalysisRequest):
    if not body.resume_text.strip():
        raise HTTPException(status_code=400, detail="resume_text cannot be empty.")
    if not body.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description cannot be empty.")

    try:
        resume_result = await extract_skills(body.resume_text)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Resume skill extraction failed: {e}")

    try:
        jd_result = await extract_skills(body.job_description)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"JD skill extraction failed: {e}")

    resume_skills = resume_result.get("skills", [])
    jd_skills = jd_result.get("skills", [])
    job_title = jd_result.get("job_title") or resume_result.get("job_title") or "Software Developer"

    if not jd_skills:
        raise HTTPException(status_code=422, detail="Could not extract any technical skills from the job description.")

    try:
        match_result = await match_skills(resume_skills, jd_skills)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Skill matching failed: {e}")

    missing_skills = match_result.get("missing_skills", [])
    recommended_skills = match_result.get("recommended_skills", [])

    roadmap = None
    if missing_skills:
        try:
            raw_roadmap = await generate_roadmap(
                missing_skills=missing_skills,
                recommended_skills=recommended_skills,
                resume_skills=resume_skills,
                job_title=job_title,
            )
            roadmap = _safe_parse_roadmap(raw_roadmap)
            print(f"ROADMAP: {'ok' if roadmap else 'failed to parse'}")
        except Exception as e:
            print(f"ROADMAP ERROR: {e}")
            roadmap = None

    return JSONResponse(content={
        "session_id": body.session_id,
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
        "job_title": job_title,
        "match_score": match_result.get("match_score", 0),
        "matched_skills": match_result.get("matched_skills", []),
        "missing_skills": missing_skills,
        "recommended_skills": recommended_skills,
        "summary": match_result.get("summary", ""),
        "roadmap": roadmap,
    })