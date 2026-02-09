export type TextElement = {
    type: "text";
    id: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    content: string
};

export type IconElement = {
    type: "icon";
    id: string;
    x: number;
    y: number;
    size: number;
    name: string;
};

export type SlideElement = TextElement | IconElement;

export type Slide = {
    id: string;
    elements: SlideElement[];
}