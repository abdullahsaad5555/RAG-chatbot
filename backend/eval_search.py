from app.vectorstore.chroma import search


# Each test: (question, a short phrase that appears in the correct passage)
# Replace these with real questions from your HR manual.
TESTS = [
    ("How many days of annual leave do employees get?", "annual leave"),
    ("What is the probation period?", "probation"),
]

hits = 0

for question, phrase in TESTS:
    results = search(question, top_k=10)
    rank = None

    for i, r in enumerate(results, start=1):
        if phrase.lower() in r["text"].lower():
            rank = i
            break

    found = rank is not None and rank <= 4
    hits += found

    status = "OK  " if found else "MISS"
    print(f"{status} rank={rank} | {question}")

print()
print(f"Top-4 search accuracy: {hits}/{len(TESTS)}")