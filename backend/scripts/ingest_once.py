"""
Manual rebuild of the document index.

Converts everything in data/raw to Markdown, wipes the vector
collection, and rebuilds it.

Run ONLY while the backend is stopped (the backend already
rebuilds on startup and whenever data/raw changes).

Usage (from backend/):
    python -m scripts.ingest_once
"""

from app.ingestion.pipeline import rebuild_index


if __name__ == "__main__":
    rebuild_index()