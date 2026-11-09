from app.ingestion.loader import load_folder
from app.ingestion.chunker import chunk_records
from app.vectorstore.chroma import add_chunks, search


# Change this to a question you know is answered in hr_manual.txt
QUESTION = "How many days of annual leave do employees get?"

docs = load_folder("data/docs")
chunks = chunk_records(docs)
total = add_chunks(chunks)

print("Vectors stored:", total)
print()
print("Question:", QUESTION)

for match in search(QUESTION):
    print("-" * 60)
    print("Score:", match["score"], "|", match["source"], "| page", match["page"])
    print(match["text"][:300])