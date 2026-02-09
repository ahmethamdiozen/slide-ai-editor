import { useEditorStore } from "@/store/editorStore";
import SlideRenderer from "./SlideRenderer";

export default function SvgCanvas() {
  const { slides, activeSlideIndex } = useEditorStore();

  if (slides.length === 0) {
    return <div>No slides yet</div>;
  }

  return <SlideRenderer slide={slides[activeSlideIndex]} />;
}
