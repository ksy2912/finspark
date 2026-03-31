from fastapi import APIRouter

from app.models.schemas import ConfigInput
from app.services.config_engine import generate_config

router = APIRouter()


@router.post("/generate-config")
def config_api(data: ConfigInput):
    return generate_config(data.name, data.aadhaar)

