import asyncio

from app.llm.generator import generate
from app.vectorstore.chroma import search


TOP_K = 4

# Chunks scoring below this are treated as unrelated.
# Starting guess. Tune it with the scores from test_chroma.py.
MIN_SCORE = 0.30

NOT_FOUND = (
    "I couldn't find this in the available YASREF documents. "
    "Please rephrase your question or contact the relevant department."
)


async def answer(question):
    """Search the documents, then let Qwen answer from the matches."""
    matches = await asyncio.to_thread(search, question, TOP_K)

    relevant = [m for m in matches if m["score"] >= MIN_SCORE]

    if not relevant:
        return NOT_FOUND

    reply = await generate(question, relevant)

    sources = sorted({f"{m['source']} (p.{m['page']})" for m in relevant})
    return reply + "\n\n---\n**Sources:** " + ", ".join(sources)