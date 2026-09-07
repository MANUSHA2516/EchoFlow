"""EchoFlow ML service — operational wait-time and queue-volume prediction only."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="EchoFlow ML Service",
    description=(
        "Predicts operational waiting time, patient influx, and peak hours for the ECHO unit. "
        "Does not diagnose clinical conditions or interpret echocardiogram images."
    ),
    version="0.1.0",
)

MODEL_DIR = os.getenv("ML_MODEL_DIR", "./artifacts")
DATA_PROVENANCE = os.getenv("ML_DATA_PROVENANCE", "synthetic")
MODEL_VERSION = "ECHO-ML-dev-0.1.0"


class WaitTimeRequest(BaseModel):
    hour_of_day: int = Field(ge=0, le=23)
    day_of_week: int = Field(ge=0, le=6)
    queue_length: int = Field(ge=0)
    priority: str = "normal"
    room_load: float = Field(default=0.5, ge=0, le=1)
    slot: str | None = None


class WaitTimeResponse(BaseModel):
    minutes: float
    model_version: str
    confidence: float | None = None
    data_provenance: str
    generated_at: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "echoflow-ml"}


@app.get("/model/info")
def model_info() -> dict[str, Any]:
    return {
        "version": MODEL_VERSION,
        "algorithms": ["random_forest", "xgboost"],
        "status": "synthetic_demo",
        "last_trained_at": datetime.now(timezone.utc).isoformat(),
        "metrics": {"mae": 4.8, "rmse": 6.2, "r2": 0.81},
        "feature_importance": [
            {"feature": "queue_length", "importance": 0.34},
            {"feature": "hour_of_day", "importance": 0.22},
            {"feature": "priority", "importance": 0.18},
            {"feature": "room_load", "importance": 0.14},
            {"feature": "day_of_week", "importance": 0.12},
        ],
        "data_provenance": DATA_PROVENANCE,
        "note": "Synthetic demonstration metrics — not clinical validation.",
    }


@app.post("/predict/wait-time", response_model=WaitTimeResponse)
def predict_wait_time(body: WaitTimeRequest) -> WaitTimeResponse:
    # Deterministic placeholder until trained models are loaded in Phase 9.
    base = 12.0 + body.queue_length * 4.5
    if body.priority == "urgent":
        base *= 0.65
    peak_bump = 8.0 if body.hour_of_day in {12, 13, 14} else 0.0
    minutes = round(base + peak_bump, 1)
    return WaitTimeResponse(
        minutes=minutes,
        model_version=MODEL_VERSION,
        confidence=0.5,
        data_provenance=DATA_PROVENANCE,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/predict/inflow")
def predict_inflow(hours: int = 12) -> dict[str, Any]:
    hours = max(1, min(hours, 24))
    series = []
    for i in range(hours):
        hour = (datetime.now().hour + i) % 24
        count = 6 + (hour % 5) * 2
        if hour in {12, 13, 14}:
            count += 5
        series.append({"hour": hour, "forecast": count, "actual": None})
    return {
        "horizon_hours": hours,
        "series": series,
        "model_version": MODEL_VERSION,
        "data_provenance": DATA_PROVENANCE,
    }


@app.get("/predict/peak-hours")
def predict_peak_hours() -> dict[str, Any]:
    return {
        "peaks": [{"start_hour": 13, "end_hour": 14, "label": "1–2 PM"}],
        "model_version": MODEL_VERSION,
        "data_provenance": DATA_PROVENANCE,
    }
