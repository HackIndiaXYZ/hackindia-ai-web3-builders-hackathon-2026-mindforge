import json
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

async def call_groq(
    messages: List[Dict[str, Any]],
    model: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 1500,
    tools: Optional[List[Dict[str, Any]]] = None,
    response_format: Optional[Dict[str, str]] = None,
    timeout: float = 30.0
) -> Dict[str, Any]:
    """
    Call Groq API using low-latency open models (e.g. openai/gpt-oss-120b or qwen/qwen3.6-27b).
    """
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload: Dict[str, Any] = {
        "model": model or settings.GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"

    if response_format:
        payload["response_format"] = response_format

    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(GROQ_API_URL, headers=headers, json=payload)
        if resp.status_code != 200:
            raise RuntimeError(f"Groq API Error ({resp.status_code}): {resp.text}")
        return resp.json()
