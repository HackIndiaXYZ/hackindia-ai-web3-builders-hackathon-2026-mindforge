import os
from typing import List
from fastembed import TextEmbedding
from app.core.config import settings

# Initialize FastEmbed singleton
_embedding_model = None

def get_embedding_model() -> TextEmbedding:
    global _embedding_model
    if _embedding_model is None:
        # Load local BAAI/bge-small-en-v1.5 model (384 dimensions)
        _embedding_model = TextEmbedding(model_name=settings.EMBEDDING_MODEL)
    return _embedding_model

def compute_embedding(text: str) -> List[float]:
    """Compute 384-dimensional vector embedding for a single text."""
    model = get_embedding_model()
    # model.embed returns a generator of numpy arrays
    embeddings = list(model.embed([text]))
    return embeddings[0].tolist()

def compute_embeddings(texts: List[str]) -> List[List[float]]:
    """Compute 384-dimensional vector embeddings for a list of texts in batch."""
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = list(model.embed(texts))
    return [e.tolist() for e in embeddings]
