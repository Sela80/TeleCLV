"""
Backend FastAPI pour l'application TeleCLV.
Endpoint unique POST /predict qui charge un modèle CatBoost et retourne une estimation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from catboost import CatBoostRegressor
import pandas as pd
import os

# Initialisation de l'application
app = FastAPI(
    title="API TeleCLV",
    description="API de prédiction de la valeur client télécom",
    version="1.0.0"
)

# Configuration CORS pour permettre les appels depuis le frontend (GitHub Pages, localhost, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ordre strict des colonnes. DOIT correspondre exactement à l'ordre d'entraînement du modèle.
FEATURE_ORDER = [
    "gender", "SeniorCitizen", "Partner", "Dependents", "PhoneService",
    "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup",
    "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
    "Contract", "PaperlessBilling", "PaymentMethod"
]

# Schéma de données attendu en entrée
class ClientProfile(BaseModel):
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

# Configuration du modèle
MODEL_PATH = "model_CatBoost_R.cbm"
model = None

def load_model():
    """Charge le modèle CatBoost en mémoire au démarrage."""
    global model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Modèle introuvable à l'emplacement : {MODEL_PATH}")
    model = CatBoostRegressor()
    model.load_model(MODEL_PATH)
    print(f"Succès : Modèle chargé depuis {MODEL_PATH}")

# Événement de démarrage de l'application
@app.on_event("startup")
async def startup_event():
    load_model()

def determine_segment(clv_value: float) -> str:
    """Catégorise la valeur estimée en segment."""
    if clv_value < 1500: 
        return "valeur faible"
    elif clv_value <= 3500: 
        return "valeur moyenne"
    else: 
        return "valeur élevée"

@app.post(
    "/predict",
    summary="Prédire la valeur client",
    responses={
        500: {
            "description": "Erreur interne du serveur : échec de la prédiction, modèle non chargé ou données invalides."
        }
    }
)
async def predict_clv(profile: ClientProfile):
    """
    Reçoit un profil client en JSON, retourne l'estimation de valeur et son segment.
    """
    try:
        # Conversion du modèle Pydantic en dictionnaire
        data = profile.dict()
        
        # Création du DataFrame avec l'ordre STRICT des colonnes
        df = pd.DataFrame([data])[FEATURE_ORDER]
        
        # Inférence
        prediction = model.predict(df)
        clv_estime = float(prediction[0])
        
        # Calcul du segment
        segment = determine_segment(clv_estime)
        
        return {
            "clv_estime": round(clv_estime, 2),
            "segment": segment
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la prédiction : {str(e)}")

@app.get("/", summary="Vérification de l'état de l'API")
async def root():
    """Endpoint de santé pour vérifier que l'API et le modèle sont opérationnels."""
    return {
        "status": "API opérationnelle", 
        "model_loaded": model is not None
    }

# Commande de lancement local :
# python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000