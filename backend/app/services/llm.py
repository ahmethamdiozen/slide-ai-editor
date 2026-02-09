import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You generate slide layout data for a presentation editor.

Rules:
- Output ONLY valid JSON
- Do NOT include explanations, comments, or markdown
- Do NOT include ids

The output MUST follow this schema:

{
  "elements": [
    {
      "type": "text",
      "x": number,
      "y": number,
      "content": "string"
    },
    {
      "type": "icon",
      "x": number,
      "y": number,
      "name": "string"
    }
  ]
}

Layout rules:
- Canvas size is 800x450
- x between 50 and 750
- y between 50 and 400
- Use icons when they help understanding (e.g. database, ai, document, chart)
- Keep text short and presentation-ready

Always generate at least one element.
"""




def generate_slide_from_prompt(prompt: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content