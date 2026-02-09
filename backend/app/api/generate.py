from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from app.models.slide import Slide, TextElement
import json
from app.services.llm import generate_slide_from_prompt

router = APIRouter()
class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    slides: list[Slide]

@router.post("/generate", response_model=GenerateResponse)
def generate_slides(payload: GenerateRequest):
    raw = generate_slide_from_prompt(payload.prompt)
    
    try:
        data = json.loads(raw)
        elements = []
        for elem in data["elements"]:
            elements.append(
                {
                    **elem,
                    "id": str(uuid.uuid4())
                }
            )
        slide = Slide(
            id=str(uuid.uuid4()),
            elements=elements
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LLM output validation failed: {str(e)}"
        )

    return {"slides": [slide]}