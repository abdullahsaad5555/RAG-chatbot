def chunk_text(
    text: str,
    chunk_size: int = 800,
    overlap: int = 150,
) -> list[str]:
    """
    Split document text into overlapping chunks.

    chunk_size:
        Maximum approximate number of characters per chunk.

    overlap:
        Number of characters repeated between consecutive chunks.
        This helps preserve context across chunk boundaries.
    """

    if not text:
        return []

    text = " ".join(text.split())

    if not text:
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")

    if overlap < 0:
        raise ValueError("overlap cannot be negative")

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))

        # If we're not at the end of the document,
        # try to finish the chunk at a natural boundary.
        if end < len(text):
            search_start = start + (chunk_size // 2)

            possible_breaks = [
                text.rfind(". ", search_start, end),
                text.rfind("? ", search_start, end),
                text.rfind("! ", search_start, end),
                text.rfind("\n", search_start, end),
            ]

            best_break = max(possible_breaks)

            if best_break != -1:
                end = best_break + 1

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = end - overlap

    return chunks


def chunk_records(
    records: list[dict],
    chunk_size: int = 800,
    overlap: int = 150,
) -> list[dict]:
    """
    Chunk document records while preserving source metadata.
    """

    chunked_records = []

    for record in records:
        text = record.get("text", "")
        source = record.get("source", "unknown")
        page = record.get("page", 1)

        chunks = chunk_text(
            text=text,
            chunk_size=chunk_size,
            overlap=overlap,
        )

        for chunk_index, chunk in enumerate(chunks):
            chunked_records.append(
                {
                    "text": chunk,
                    "source": source,
                    "page": page,
                    "chunk_index": chunk_index,
                }
            )

    return chunked_records