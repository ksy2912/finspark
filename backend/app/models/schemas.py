from pydantic import BaseModel


class RequirementInput(BaseModel):
    text: str


class ConfigInput(BaseModel):
    name: str
    aadhaar: str


class SimulationInput(BaseModel):
    aadhaar_number: str
    full_name: str
    dob: str | None = None

