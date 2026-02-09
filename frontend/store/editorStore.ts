import { create } from "zustand";
import { Slide } from "@/types/slide";

type EditorState = {
  slides: Slide[];
  activeSlideIndex: number;

  selectedElementId: string | null;

  setSlides: (slides: Slide[]) => void;
  selectElement: (id: string | null) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;

};

export const useEditorStore = create<EditorState>((set) => ({
  slides: [],
  activeSlideIndex: 0,

  selectedElementId: null,

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
      set((state) => ({
        slides: state.slides.map((slide, slideIndex) => {
          if (slideIndex !== state.activeSlideIndex) return slide;

          return {
            ...slide,
            elements: slide.elements.map((el) =>
              el.id === id ? { ...el, x, y } : el
            ),
          };
        }),
      })),

}));
