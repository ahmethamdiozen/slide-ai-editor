import { create } from "zustand";
import { Slide, SlideElement } from "@/types/slide";
import { v4 as uuidv4 } from "uuid";

type EditorState = {
  // Data
  slides: Slide[];
  activeSlideIndex: number;
  clipboard: SlideElement | null;

  // UI state
  selectedElementId: string | null;
  editingElementId: string | null;

  // Actions
  setSlides: (slides: Slide[]) => void;
  selectElement: (id: string | null) => void;
  setEditingElement: (id: string | null) => void;
  
  // Element Actions
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  copyElement: (id: string) => void;
  cutElement: (id: string) => void;
  pasteElement: () => void;
  moveElementLayer: (id: string, direction: "up" | "down" | "front" | "back") => void;
  
  // Transform Actions
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number, height: number) => void;
  updateElementTransform: (id: string, x: number, y: number, width: number, height: number) => void;
  updateElementContent: (id: string, content: string) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  // ======================
  // Initial state
  // ======================
  slides: [],
  activeSlideIndex: 0,
  clipboard: null,
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
      editingElementId: null,
    }),

  setEditingElement: (id) =>
    set({
      editingElementId: id,
      selectedElementId: id,
    }),

  deleteElement: (id) =>
    set((state) => {
      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        return { ...slide, elements: slide.elements.filter((el) => el.id !== id) };
      });
      return { slides, selectedElementId: null };
    }),

  duplicateElement: (id) =>
    set((state) => {
      const activeSlide = state.slides[state.activeSlideIndex];
      const element = activeSlide.elements.find((el) => el.id === id);
      if (!element) return state;

      const newElement = { ...element, id: uuidv4(), x: element.x + 20, y: element.y + 20 };
      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        return { ...slide, elements: [...slide.elements, newElement] };
      });

      return { slides, selectedElementId: newElement.id };
    }),

  copyElement: (id) =>
    set((state) => {
      const activeSlide = state.slides[state.activeSlideIndex];
      const element = activeSlide.elements.find((el) => el.id === id);
      return { clipboard: element ? { ...element } : null };
    }),

  cutElement: (id) =>
    set((state) => {
      const activeSlide = state.slides[state.activeSlideIndex];
      const element = activeSlide.elements.find((el) => el.id === id);
      if (!element) return state;

      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        return { ...slide, elements: slide.elements.filter((el) => el.id !== id) };
      });

      return { slides, clipboard: { ...element }, selectedElementId: null };
    }),

  pasteElement: () =>
    set((state) => {
      if (!state.clipboard) return state;
      const newElement = { ...state.clipboard, id: uuidv4(), x: state.clipboard.x + 20, y: state.clipboard.y + 20 };
      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        return { ...slide, elements: [...slide.elements, newElement] };
      });
      return { slides, selectedElementId: newElement.id };
    }),

  moveElementLayer: (id, direction) =>
    set((state) => {
      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        const elements = [...slide.elements];
        const index = elements.findIndex((el) => el.id === id);
        if (index === -1) return slide;

        const el = elements.splice(index, 1)[0];
        if (direction === "up") elements.splice(Math.min(index + 1, elements.length), 0, el);
        else if (direction === "down") elements.splice(Math.max(index - 1, 0), 0, el);
        else if (direction === "front") elements.push(el);
        else if (direction === "back") elements.unshift(el);

        return { ...slide, elements };
      });
      return { slides };
    }),

  updateElementPosition: (id, x, y) =>
    set((state) => {
      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        return { ...slide, elements: slide.elements.map((el) => el.id === id ? { ...el, x, y } : el) };
      });
      return { slides };
    }),

  updateElementSize: (id, width, height) =>
    set((state) => {
      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        return {
          ...slide,
          elements: slide.elements.map((el) => {
            if (el.id !== id) return el;
            if (el.type === "icon") return { ...el, size: Math.max(width, height) };
            return { ...el, width, height };
          }),
        };
      });
      return { slides };
    }),

  updateElementTransform: (id, x, y, width, height) =>
    set((state) => {
      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        return {
          ...slide,
          elements: slide.elements.map((el) => {
            if (el.id !== id) return el;
            if (el.type === "icon") return { ...el, x, y, size: Math.max(width, height) };
            return { ...el, x, y, width, height };
          }),
        };
      });
      return { slides };
    }),

  updateElementContent: (id, content) =>
    set((state) => {
      const slides = state.slides.map((slide, idx) => {
        if (idx !== state.activeSlideIndex) return slide;
        return { ...slide, elements: slide.elements.map((el) => el.type === "text" && el.id === id ? { ...el, content } : el) };
      });
      return { slides };
    }),
}));
