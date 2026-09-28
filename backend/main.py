"""
API FastAPI de TeleCLV.

Expose un endpoint de prédiction permettant d'estimer la Customer Lifetime
Value (CLV proxy) d'un profil client télécom à l'aide d'un modèle CatBoost.
"""

from pathlib import Path

import pandas as pd
from catboost import CatBoostRegressor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model_CatBoost_R.cbm"

FEATURE_ORDER = [
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod",
]


class ClientProfile(BaseModel):
    """Profil client attendu par le modèle."""

    gender: str
    SeniorCitizen: int
    Partner: str
    Dependents: str
    PhoneService: str
    MultipleLines: str
    InternetService: str
    OnlineSecurity: str
    OnlineBackup: str
    DeviceProtection: str
    TechSupport: str
    StreamingTV: str
    StreamingMovies: str
    Contract: str
    PaperlessBilling: str
    PaymentMethod: str


class PredictionResponse(BaseModel):
    """Réponse standardisée de l'API."""

    clv_estime: float
    segment: str


app = FastAPI(
    title="TeleCLV API",
    description="API de prédiction de la Customer Lifetime Value (CLV proxy).",
    version="1.1.0",
)

# Le frontend est actuellement hébergé séparément (GitHub Pages).
# Cette configuration reste volontairement permissive pour la démonstration.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

model: CatBoostRegressor | None = None


def load_model() -> CatBoostRegressor:
    """Charge le modèle CatBoost depuis un chemin indépendant du répertoire courant."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Modèle introuvable : {MODEL_PATH}")

    loaded_model = CatBoostRegressor()
    loaded_model.load_model(str(MODEL_PATH))
    return loaded_model


@app.on_event("startup")
async def startup_event() -> None:
    """Charge le modèle une seule fois au démarrage de l'API."""
    global model
    model = load_model()


def determine_segment(clv_value: float) -> str:
    """Retourne le segment associé à la CLV estimée."""
    if clv_value < 1500:
        return "valeur faible"
    if clv_value <= 3500:
        return "valeur moyenne"
    return "valeur élevée"


@app.get("/", summary="État de l'API")
async def root() -> dict[str, object]:
    """Endpoint simple de vérification de disponibilité."""
    return {
        "status": "API opérationnelle",
        "model_loaded": model is not None,
    }


@app.get("/health", summary="Health check")
async def health() -> dict[str, object]:
    """Endpoint dédié aux vérifications de santé du service."""
    return {
        "status": "ok" if model is not None else "degraded",
        "model_loaded": model is not None,
    }


@app.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Prédire la valeur client",
)
async def predict_clv(profile: ClientProfile) -> PredictionResponse:
    """Reçoit un profil client et retourne sa CLV estimée et son segment."""
    if model is None:
        raise HTTPException(status_code=503, detail="Modèle non chargé.")

    try:
        data = profile.model_dump()
        df = pd.DataFrame([data])[FEATURE_ORDER]

        prediction = model.predict(df)
        clv_estime = max(0.0, float(prediction[0]))

        return PredictionResponse(
            clv_estime=round(clv_estime, 2),
            segment=determine_segment(clv_estime),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la prédiction.",
        ) from exc


# Lancement local :
# uvicorn main:app --reload --host 0.0.0.0 --port 8000
