"""Run this script to (re)train the disease prediction model:
    python -m app.ml.train_model
"""
from .model import train

if __name__ == "__main__":
    train()
    print("Training complete. Model artifacts saved in app/ml/.")
