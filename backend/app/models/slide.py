from pydantic import BaseModel, Field
from typing import Literal, Annotated

class TextElement(BaseModel):
    type: Literal["text"]
    id: str
    x: float
    y: float
    width: float | None = None
    height: float | None = None
    content: str

class IconElement(BaseModel):
    type: Literal["icon"]
    id: str
    x: float
    y: float
    size: float
    name: str

SlideElement = Annotated[
    TextElement | IconElement,
    Field(discriminator="type")
]

class Slide(BaseModel):
    id: str
    elements: list[SlideElement]