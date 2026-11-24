import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, f1_score
import joblib

def train_model():
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'civic_complaints_dataset.csv')
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    
    df = pd.read_csv(data_path)
    
    # Map each category to its primary department
    cat_to_dept = df.groupby('category')['department'].first().to_dict()
    
    X = df['description'].values
    y = df['category'].values
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    
    # Test MultinomialNB vs LogisticRegression
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words='english',
            min_df=1
        )),
        ('clf', MultinomialNB(alpha=0.3))
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    lr_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words='english',
            min_df=1
        )),
        ('clf', LogisticRegression(C=5.0, max_iter=1000, random_state=42))
    ])
    lr_pipeline.fit(X_train, y_train)
    lr_pred = lr_pipeline.predict(X_test)
    lr_acc = accuracy_score(y_test, lr_pred)
    lr_f1 = f1_score(y_test, lr_pred, average='weighted')
    
    best_pipeline = lr_pipeline if lr_acc >= acc else pipeline
    best_acc = max(acc, lr_acc)
    best_f1 = lr_f1 if lr_acc >= acc else f1
    best_name = "LogisticRegression(C=5.0)" if lr_acc >= acc else "MultinomialNB(alpha=0.3)"
    
    print(f"[ML Training] Selected best model: {best_name}")
    print(f"[ML Training] Model Accuracy: {best_acc * 100:.2f}%")
    print(f"[ML Training] Model F1-Score: {best_f1 * 100:.2f}%")
    
    # Train on full dataset for maximum deployment accuracy
    best_pipeline.fit(X, y)
    
    # Save Pipeline and metadata
    model_save_path = os.path.join(model_dir, 'civic_classifier.joblib')
    payload = {
        'pipeline': best_pipeline,
        'cat_to_dept': cat_to_dept,
        'categories': list(best_pipeline.classes_),
        'accuracy': float(best_acc),
        'f1_score': float(best_f1),
        'algorithm': best_name
    }
    joblib.dump(payload, model_save_path)
    print(f"[ML Training] Model saved successfully to: {model_save_path}")
    
    metrics_path = os.path.join(model_dir, 'training_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump({
            'algorithm': best_name,
            'accuracy': best_acc,
            'f1_score': best_f1,
            'classes': list(best_pipeline.classes_),
            'sample_count': len(df)
        }, f, indent=2)
    print(f"[ML Training] Metrics saved to: {metrics_path}")

if __name__ == '__main__':
    train_model()
