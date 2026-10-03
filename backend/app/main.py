"""AquaLink OneHealth FastAPI Main Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.routes import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AquaLink OneHealth - AI-Assisted Assessment Platform for IEEE OneAquaHealth Hackathon. "
                "From citizen observations to actionable One Health intelligence. "
                "Compliant with HL7 FHIR R4 and OGC standards.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for seamless local and container development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Welcome to AquaLink OneHealth API",
        "version": settings.VERSION,
        "docs": "/docs",
        "standards": ["HL7 FHIR R4", "OGC GeoJSON", "WQI / BMWP / FBI / OneHealth Composite"]
    }
