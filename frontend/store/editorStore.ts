import { create } from "zustand";
import { Slide } from "@/types/slide";

type EditorState = {
  slides: Slide[];
  activeSlideIndex: number;
  setSlides: (slides: Slide[]) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  slides: [],
  activeSlideIndex: 0,
  setSlides: (slides) => set({ slides, activeSlideIndex: 0 }),
}));
