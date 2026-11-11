from app.ingestion.loader import load_folder
from app.ingestion.chunker import chunk_records


docs = load_folder("data/docs")
chunks = chunk_records(docs, chunk_size=800, overlap=150)

print("Total chunks:", len(chunks))

for c in chunks[:5]:
    print("=" * 60)
    print(f"{c['source']} | chunk {c['chunk_index']} | length {len(c['text'])}")
    print(c["text"])