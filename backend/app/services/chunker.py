import hashlib
from typing import List, Dict, Any

def chunk_text(
    text: str,
    target_chars: int = 1500,
    overlap_chars: int = 250
) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks respecting paragraph and sentence boundaries.
    Target ~400-600 words / 1500 chars with 250 char overlap.
    """
    if not text or not text.strip():
        return []

    paragraphs = text.split("\n\n")
    chunks: List[str] = []
    current_chunk = []
    current_length = 0

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # If a single paragraph exceeds target, split by sentences or linebreaks
        if len(para) > target_chars:
            lines = para.split("\n")
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                if current_length + len(line) > target_chars and current_chunk:
                    chunk_str = "\n".join(current_chunk)
                    chunks.append(chunk_str)
                    # Keep overlap
                    overlap_text = chunk_str[-overlap_chars:] if len(chunk_str) > overlap_chars else chunk_str
                    current_chunk = [overlap_text, line]
                    current_length = len(overlap_text) + len(line)
                else:
                    current_chunk.append(line)
                    current_length += len(line)
        else:
            if current_length + len(para) > target_chars and current_chunk:
                chunk_str = "\n\n".join(current_chunk)
                chunks.append(chunk_str)
                overlap_text = chunk_str[-overlap_chars:] if len(chunk_str) > overlap_chars else chunk_str
                current_chunk = [overlap_text, para]
                current_length = len(overlap_text) + len(para)
            else:
                current_chunk.append(para)
                current_length += len(para)

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    # Format chunks with checksums
    result = []
    for i, c in enumerate(chunks):
        c_clean = c.strip()
        if len(c_clean) > 20: # Discard tiny fragments
            checksum = hashlib.sha256(c_clean.encode("utf-8")).hexdigest()[:16]
            result.append({
                "index": i,
                "content": c_clean,
                "checksum": checksum,
                "length": len(c_clean)
            })

    return result
