import { useEditorStore } from "@/store/editorStore";
import SlideRenderer from "./SlideRenderer";

export default function SvgCanvas() {
  const { slides, activeSlideIndex } = useEditorStore();

  if (slides.length === 0) {
    return <div>No slides yet</div>;
  }

  return (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    <div style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
      <SlideRenderer slide={slides[activeSlideIndex]} />
    </div>
  </div>
);

}
