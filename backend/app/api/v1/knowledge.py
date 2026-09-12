from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.models import KnowledgeSource, KnowledgeChunk, Workspace
from app.schemas.schemas import KnowledgeSourceCreate, KnowledgeSourceResponse, KnowledgeChunkResponse
from app.services.chunker import chunk_text
from app.services.embedder import compute_embeddings
from app.services.crawler import fetch_page
from app.services.agent_runtime import retrieve_knowledge_chunks

router = APIRouter(prefix="/workspaces/{id}/knowledge", tags=["Knowledge Base"])

@router.get("/sources", response_model=List[KnowledgeSourceResponse])
def list_sources(id: UUID, db: Session = Depends(get_db)):
    return db.query(KnowledgeSource).filter(KnowledgeSource.workspace_id == id).all()

@router.post("/sources", response_model=KnowledgeSourceResponse)
async def add_source(id: UUID, payload: KnowledgeSourceCreate, db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    content_to_index = ""
    title = payload.title or "Custom Knowledge"

    if payload.type == "url" and payload.url:
        page_data = await fetch_page(payload.url)
        content_to_index = page_data.get("content", "")
        title = page_data.get("title", title)
    else:
        content_to_index = payload.raw_content or ""

    if not content_to_index.strip():
        raise HTTPException(status_code=400, detail="No readable content found to index")

    # Create KnowledgeSource record
    source = KnowledgeSource(
        workspace_id=id,
        type=payload.type,
        url=payload.url,
        title=title,
        status="indexed"
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    # Chunk and embed
    chunks = chunk_text(content_to_index)
    if chunks:
        embeddings = compute_embeddings([c["content"] for c in chunks])
        for c, emb in zip(chunks, embeddings):
            chunk_obj = KnowledgeChunk(
                workspace_id=id,
                source_id=source.id,
                content=c["content"],
                embedding=emb,
                metadata_={"url": payload.url, "title": title, "chunk_idx": c["index"]}
            )
            db.add(chunk_obj)
        db.commit()

    return source

@router.delete("/sources/{source_id}")
def delete_source(id: UUID, source_id: UUID, db: Session = Depends(get_db)):
    source = db.query(KnowledgeSource).filter(
        KnowledgeSource.id == source_id,
        KnowledgeSource.workspace_id == id
    ).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    db.delete(source)
    db.commit()
    return {"success": True, "message": "Source and associated chunks deleted."}

@router.get("/search")
def search_knowledge(
    id: UUID,
    q: str = Query(..., description="Query text to search semantically"),
    top_k: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Admin preview of RAG semantic search results."""
    chunks = retrieve_knowledge_chunks(db, id, q, top_k=top_k)
    return {"query": q, "results": chunks}
