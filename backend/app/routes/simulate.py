from fastapi import APIRouter

from app.models.schemas import SimulationInput
from app.services.simulation_engine import run_simulation

router = APIRouter()


@router.post("/simulate")
def simulate_api(data: SimulationInput):
    return run_simulation(data.dict())

