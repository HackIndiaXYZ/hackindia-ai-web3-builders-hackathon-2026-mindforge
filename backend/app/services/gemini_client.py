import os
import json
import logging
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.groq_client import call_groq

logger = logging.getLogger(__name__)

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

def convert_messages_for_gemini(messages: List[Dict[str, str]]) -> tuple[Optional[str], List[Dict[str, Any]]]:
    system_instruction = None
    contents = []

    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")

        if role == "system":
            system_instruction = content
        elif role == "assistant" or role == "model":
            contents.append({
                "role": "model",
                "parts": [{"text": content}]
            })
        else:
            contents.append({
                "role": "user",
                "parts": [{"text": content}]
            })

    if not contents:
        contents.append({
            "role": "user",
            "parts": [{"text": "Hello"}]
        })

    return system_instruction, contents

async def call_gemini(messages: List[Dict[str, str]], temperature: float = 0.2) -> Dict[str, Any]:
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not configured. Falling back to Groq.")
        return await call_groq(messages=messages, temperature=temperature)

    system_instruction, contents = convert_messages_for_gemini(messages)
    model = settings.GEMINI_MODEL or "gemini-3.6-flash"

    payload: Dict[str, Any] = {
        "contents": contents,
        "generationConfig": {
            "temperature": temperature
        }
    }
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    candidate_models = [model, "gemini-flash-latest", "gemini-2.5-flash-lite"]

    async with httpx.AsyncClient(timeout=35.0) as client:
        for m in candidate_models:
            url = f"{GEMINI_BASE_URL}/{m}:generateContent?key={api_key}"
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            text_content = parts[0].get("text", "").strip()
                            return {
                                "choices": [
                                    {
                                        "message": {
                                            "role": "assistant",
                                            "content": text_content
                                        }
                                    }
                                ],
                                "model": m,
                                "provider": "gemini"
                            }
                logger.warning(f"Gemini model {m} returned status {resp.status_code}: {resp.text[:150]}")
            except Exception as e:
                logger.warning(f"Gemini model {m} call failed: {e}")

    logger.warning("All Gemini candidate models failed. Failing over to Groq.")
    return await call_groq(messages=messages, temperature=temperature)
