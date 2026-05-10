import json
import re
from pathlib import Path

import httpx

from app.config import settings

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

SKILL_EXTRACTION_PROMPT = (PROMPTS_DIR / "skill_extraction.txt").read_text()
SKILL_MATCHING_PROMPT = (PROMPTS_DIR / "skill_matching.txt").read_text()
ROADMAP_PROMPT = (PROMPTS_DIR / "roadmap_generation.txt").read_text()

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"
ROADMAP_MAX_TOKENS = 3000


async def _call_groq(prompt: str, max_tokens: int = 1500) -> dict:
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=45) as client:
        response = await client.post(GROQ_URL, headers=headers, json=body)

    response.raise_for_status()

    raw_content = response.json()["choices"][0]["message"]["content"]
    return _parse_json_response(raw_content)


def _parse_json_response(content: str) -> dict:
    content = re.sub(r"^```(?:json)?\s*", "", content.strip())
    content = re.sub(r"\s*```$", "", content.strip())

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM returned invalid JSON. Raw response: {content[:300]}") from e


async def extract_skills(text: str) -> dict:
    prompt = SKILL_EXTRACTION_PROMPT.replace("{TEXT}", text)
    return await _call_groq(prompt)


async def match_skills(resume_skills: list[str], jd_skills: list[str]) -> dict:
    prompt = SKILL_MATCHING_PROMPT.replace(
        "{RESUME_SKILLS}", ", ".join(resume_skills)
    ).replace(
        "{JD_SKILLS}", ", ".join(jd_skills)
    )
    return await _call_groq(prompt)


async def generate_roadmap(
    missing_skills: list[str],
    recommended_skills: list[str],
    resume_skills: list[str],
    job_title: str,
) -> dict:
    prompt = (
        ROADMAP_PROMPT
        .replace("{JOB_TITLE}", job_title or "Software Developer")
        .replace("{RESUME_SKILLS}", ", ".join(resume_skills) if resume_skills else "Not specified")
        .replace("{MISSING_SKILLS}", ", ".join(missing_skills) if missing_skills else "None")
        .replace("{RECOMMENDED_SKILLS}", ", ".join(recommended_skills) if recommended_skills else "None")
    )
    return await _call_groq(prompt, max_tokens=ROADMAP_MAX_TOKENS)