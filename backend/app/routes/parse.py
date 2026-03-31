from fastapi import APIRouter

from app.models.schemas import RequirementInput
from app.services.groq_parser import fallback_parser, parse_with_groq

router = APIRouter()


@router.post("/parse")
def parse_requirement(req: RequirementInput):
    try:
        return parse_with_groq(req.text)
    except Exception as exc:
        print(f"Groq parsing failed: {exc}")
        print("Using fallback parser...")
        return fallback_parser(req.text)

