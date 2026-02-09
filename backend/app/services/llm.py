import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are a function that generates slide layout data.

Rules:
- Output ONLY valid JSON
- Do NOT include explanations, markdown, or comments
- Do NOT include ids
- The output MUST follow this schema:

{
  "elements": [
    {
      "type": "text",
      "x": number,
      "y": number,
      "content": "string"
    }
  ]
}

Layout rules:
- Canvas size is 800x450
- x between 50 and 750
- y between 50 and 400
- Keep text short and presentation-ready

NEVER return an empty object.
If unsure, still generate ONE text element summarizing the prompt.
"""



def generate_slide_from_prompt(prompt: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    return response.choices[0].message.content