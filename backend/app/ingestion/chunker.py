import re


# Splits after . ! or ? followed by whitespace
SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


def _normalize(text):
    """Clean spacing but KEEP line breaks and paragraph breaks."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = [" ".join(line.split()) for line in text.split("\n")]
    text = "\n".join(lines)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _is_heading(line):
    """Guess whether a line is a section heading."""
    line = line.strip()

    if not line or len(line) > 80:
        return False
    if line.endswith((".", ",", ";")):
        return False
    if len(line.split()) > 10:
        return False

    if line.isupper():
        return True
    if re.match(r"^(\d+(\.\d+)*[.)]?|[A-Z][.)])\s+\S", line):
        return True
    if line.endswith(":"):
        return True
    if line.istitle():
        return True

    return False


def _blocks(text):
    """Yield (heading_or_None, paragraph_text) pairs."""
    if "\n\n" in text:
        paragraphs = text.split("\n\n")
    else:
        paragraphs = text.split("\n")

    for para in paragraphs:
        lines = [line for line in para.split("\n") if line.strip()]

        if not lines:
            continue

        if _is_heading(lines[0]):
            yield lines[0].rstrip(":").strip(), "\n".join(lines[1:])
        else:
            yield None, "\n".join(lines)


def _split_sentences(text, max_len):
    """Split into sentences; hard-split only sentences longer than max_len."""
    out = []

    for sentence in SENTENCE_SPLIT.split(text):
        sentence = sentence.strip()

        if not sentence:
            continue

        if len(sentence) <= max_len:
            out.append(sentence)
            continue

        buf = ""
        for word in sentence.split():
            if buf and len(buf) + 1 + len(word) > max_len:
                out.append(buf)
                buf = word
            else:
                buf = f"{buf} {word}".strip()

        if buf:
            out.append(buf)

    return out


def _units_for_paragraph(paragraph, chunk_size):
    """Keep a paragraph whole if it fits, otherwise group its sentences."""
    if len(paragraph) <= chunk_size:
        return [paragraph]

    units = []
    buf = ""

    for sentence in _split_sentences(paragraph, chunk_size):
        if buf and len(buf) + 1 + len(sentence) > chunk_size:
            units.append(buf)
            buf = sentence
        else:
            buf = f"{buf} {sentence}".strip()

    if buf:
        units.append(buf)

    return units


def _tail_overlap(text, overlap):
    """Last whole sentence(s) of text, up to `overlap` characters."""
    if overlap <= 0:
        return ""

    tail = ""

    for sentence in reversed(SENTENCE_SPLIT.split(text)):
        sentence = sentence.strip()

        if not sentence:
            continue

        if len(tail) + len(sentence) + 1 > overlap:
            break

        tail = f"{sentence} {tail}".strip()

    return tail


def chunk_text(text, chunk_size=800, overlap=150):
    """Split text into structure-aware chunks with sentence-level overlap."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and smaller than chunk_size")

    text = _normalize(text or "")

    if not text:
        return []

    chunks = []
    parts = []
    length = 0
    heading = None
    has_new = False

    def flush(carry):
        nonlocal parts, length, has_new

        if not has_new:
            parts, length = [], 0
            return

        body = "\n\n".join(parts)
        chunks.append(f"{heading}\n{body}" if heading else body)

        tail = _tail_overlap(parts[-1], overlap) if carry else ""
        parts = [tail] if tail else []
        length = len(tail)
        has_new = False

    for block_heading, paragraph in _blocks(text):
        # New section: close the current chunk, don't carry overlap across sections
        if block_heading is not None and block_heading != heading:
            flush(carry=False)
            heading = block_heading

        if not paragraph:
            continue

        for unit in _units_for_paragraph(paragraph, chunk_size):
            extra = len(unit) + (2 if parts else 0)

            if has_new and length + extra > chunk_size:
                flush(carry=True)
                extra = len(unit) + (2 if parts else 0)

            parts.append(unit)
            length += extra
            has_new = True

    flush(carry=False)
    return chunks


def chunk_records(records, chunk_size=800, overlap=150):
    """Chunk document records while preserving source metadata."""
    chunked_records = []

    for record in records:
        chunks = chunk_text(
            text=record.get("text", ""),
            chunk_size=chunk_size,
            overlap=overlap,
        )

        for chunk_index, chunk in enumerate(chunks):
            chunked_records.append(
                {
                    "text": chunk,
                    "source": record.get("source", "unknown"),
                    "page": record.get("page", 1),
                    "chunk_index": chunk_index,
                }
            )

    return chunked_records