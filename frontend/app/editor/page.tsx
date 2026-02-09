"use client";

import { useState } from "react";
import { generateSlides } from "@/lib/api";
import { useEditorStore } from "@/store/editorStore";
import SvgCanvas from "@/components/SvgCanvas";

export default function EditorPage() {
  const [prompt, setPrompt] = useState("");
  const setSlides = useEditorStore((s) => s.setSlides);

  async function handleGenerate() {
    const slides = await generateSlides(prompt);
    setSlides(slides);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>AI Slide Editor</h1>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt"
      />

      <button onClick={handleGenerate}>Generate</button>

      <div style={{ marginTop: 24 }}>
        <SvgCanvas />
      </div>
    </div>
  );
}
