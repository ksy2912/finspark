from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import parse, config, simulate

app = FastAPI()

# CORS (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parse.router)
app.include_router(config.router)
app.include_router(simulate.router)


@app.get("/")
def root():
    return {"message": "Integration Engine Running 🚀"}

