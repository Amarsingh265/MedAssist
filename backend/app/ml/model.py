"""
Lightweight disease-prediction model.

This is a DEMO / educational model trained on a small synthetic
symptom-disease dataset (see disease_data.csv). It is NOT a validated
medical device and must never be presented to end users as a real
diagnosis - only as a preliminary, informational triage aid.
"""
import os
import re
import joblib
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "disease_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.joblib")

# Diseases that should always be flagged as an emergency regardless of
# model confidence, because their names/symptoms indicate urgent care.
EMERGENCY_KEYWORDS = ["emergency", "heart attack", "stroke"]


def _normalize(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def train():
    df = pd.read_csv(DATA_PATH)
    df["symptoms_norm"] = df["symptoms"].apply(
        lambda s: _normalize(s.replace(",", " "))
    )

    vectorizer = CountVectorizer(token_pattern=r"[a-zA-Z]+")
    X = vectorizer.fit_transform(df["symptoms_norm"])
    y = df["disease"]

    model = MultinomialNB()
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    return model, vectorizer


def _load():
    if not (os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH)):
        return train()
    return joblib.load(MODEL_PATH), joblib.load(VECTORIZER_PATH)


_model, _vectorizer = _load()


def predict_disease(symptoms: list[str], free_text: str = "") -> dict:
    """
    Returns the top predicted disease plus a differential (ranked list)
    of other candidates with their probabilities.
    """
    combined = " ".join(symptoms) + " " + (free_text or "")
    norm = _normalize(combined)

    X = _vectorizer.transform([norm])
    probs = _model.predict_proba(X)[0]
    classes = _model.classes_

    ranked = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
    top_disease, top_prob = ranked[0]

    is_emergency = any(kw in top_disease.lower() for kw in EMERGENCY_KEYWORDS)

    return {
        "top_disease": top_disease,
        "confidence": round(float(top_prob), 4),
        "is_emergency_flag": is_emergency,
        "differential": [
            {"disease": d, "probability": round(float(p), 4)}
            for d, p in ranked[1:5]
        ],
    }


if __name__ == "__main__":
    train()
    print("Model trained and saved.")
