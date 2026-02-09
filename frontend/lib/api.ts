import { Slide } from "@/types/slide";

const API_BASE = "http://127.0.0.1:8000/api";

export async function generateSlides(prompt: string): Promise<Slide[]> {
    const res = await fetch(`${API_BASE}/generate`,{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({prompt}),
    })

    if(!res.ok) {
        throw new Error("Failed to generate slides");
    }

    const data = await res.json();
    return data.slides;
}