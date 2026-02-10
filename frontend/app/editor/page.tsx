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
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 260,
          borderRight: "1px solid #ddd",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h3>AI Generate</h3>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the slide..."
          rows={4}
          style={{ resize: "none" }}
        />

        <button onClick={handleGenerate}>Generate</button>
      </div>

      {/* Canvas Area */}
      <div style={{ flex: 1, padding: 24, background: "#f5f5f5" }}>
        <SvgCanvas />
      </div>
    </div>
  );
}
