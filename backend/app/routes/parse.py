from fastapi import APIRouter

from app.models.schemas import RequirementInput
from app.services.groq_parser import fallback_parser, parse_with_groq

router = APIRouter()


@router.post("/parse")
def parse_requirement(req: RequirementInput):
    result = parse_with_groq(req.text)

    if result:
        return {"parsed": result}

    return {"parsed": fallback_parser(req.text)}

