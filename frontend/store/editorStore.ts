import { create } from "zustand";
import { Slide } from "@/types/slide";

type EditorState = {
  // Data
  slides: Slide[];
  activeSlideIndex: number;

  // UI state
  selectedElementId: string | null;
  editingElementId: string | null;

  // Actions
  setSlides: (slides: Slide[]) => void;
  selectElement: (id: string | null) => void;
  setEditingElement: (id: string | null) => void;
  deleteElement: (id: string) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number, height: number) => void;
  updateElementContent: (id: string, content: string) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  // ======================
  // Initial state
  // ======================
  slides: [],
  activeSlideIndex: 0,
  selectedElementId: null,
  editingElementId: null,

  // ======================
  // Actions
  // ======================

  setSlides: (slides) =>
    set({
      slides,
      activeSlideIndex: 0,
      selectedElementId: null,
      editingElementId: null,
    }),

  selectElement: (id) =>
    set({
      selectedElementId: id,
      editingElementId: null, // Herhangi bir seçimde edit modunu sıfırla
    }),

  setEditingElement: (id) =>
    set({
      editingElementId: id,
      selectedElementId: id,
    }),

  deleteElement: (id) =>
    set((state) => {
      const slides = state.slides.map((slide, slideIndex) => {
        if (slideIndex !== state.activeSlideIndex) return slide;

        return {
          ...slide,
          elements: slide.elements.filter((el) => el.id !== id),
        };
      });

      return { slides, selectedElementId: null };
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

  updateElementSize: (id, width, height) =>
    set((state) => {
      const slides = state.slides.map((slide, slideIndex) => {
        if (slideIndex !== state.activeSlideIndex) return slide;

        return {
          ...slide,
          elements: slide.elements.map((el) => {
            if (el.id !== id) return el;

            if (el.type === "icon") {
              return { ...el, size: Math.max(width, height) };
            }

            return { ...el, width, height };
          }),
        };
      });

      return { slides };
    }),

  updateElementContent: (id, content) =>
    set((state) => {
      const slides = state.slides.map((slide, slideIndex) => {
        if (slideIndex !== state.activeSlideIndex) return slide;

        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.type === "text" && el.id === id ? { ...el, content } : el
          ),
        };
      });

      return { slides };
    }),
}));
