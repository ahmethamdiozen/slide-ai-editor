import { create } from "zustand";
import { Slide } from "@/types/slide";

type EditorState = {
  // Data
  slides: Slide[];
  activeSlideIndex: number;

  // UI state
  selectedElementId: string | null;

  // Actions
  setSlides: (slides: Slide[]) => void;
  selectElement: (id: string | null) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  // ======================
  // Initial state
  // ======================
  slides: [],
  activeSlideIndex: 0,
  selectedElementId: null,

  // ======================
  // Actions
  // ======================

  setSlides: (slides) =>
    set({
      slides,
      activeSlideIndex: 0,
      selectedElementId: null,
    }),

  selectElement: (id) =>
    set({
      selectedElementId: id,
    }),

  updateElementPosition: (id, x, y) =>
    set((state) => {
      const slides = state.slides.map((slide, slideIndex) => {
        if (slideIndex !== state.activeSlideIndex) return slide;

        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === id ? { ...el, x, y } : el
          ),
        };
      });

      return { slides };
    }),
}));
