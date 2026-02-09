import { Slide } from "@/types/slide";
import { useEditorStore } from "@/store/editorStore";
import { ICONS, DEFAULT_ICON } from "./icons"; 
import { useRef } from "react"

type Props = {
  slide: Slide;
};

function getSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM()!.inverse());
}


export default function SlideRenderer({ slide }: Props) {
  const { selectedElementId, selectElement } = useEditorStore();
  const dragRef = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
  } | null>(null);


  const { updateElementPosition } = useEditorStore();


  return (
    <svg
      width={800}
      height={450}
      style={{ border: "1px solid #ccc" }}
        onMouseDown={() => {
          selectElement(null);
        }}
        onMouseMove={(e) => {
          if (!dragRef.current) return;

          const svg = e.currentTarget;
          const point = getSvgPoint(svg, e.clientX, e.clientY);

          const dx = point.x - dragRef.current.startMouseX;
          const dy = point.y - dragRef.current.startMouseY;

          updateElementPosition(
            dragRef.current.id,
            dragRef.current.startX + dx,
            dragRef.current.startY + dy
          );
        }}
      onMouseUp={() => {
        dragRef.current = null;
      }}
      onMouseLeave={() => {
        dragRef.current = null;
      }}
    >

      {slide.elements.map((el) => {
        const isSelected = el.id === selectedElementId;

        // TEXT ELEMENT
        if (el.type === "text") {
          return (
            <g
              onMouseDown={(e) => {
                e.stopPropagation();

                const svg = e.currentTarget.ownerSVGElement!;
                const point = getSvgPoint(svg, e.clientX, e.clientY);

                dragRef.current = {
                  id: el.id,
                  startMouseX: point.x,
                  startMouseY: point.y,
                  startX: el.x,
                  startY: el.y,
                };

                selectElement(el.id);
              }}

              key={el.id}
              transform={`translate(${el.x}, ${el.y})`}
              onClick={() => selectElement(el.id)}
              style={{ cursor: "pointer" }}
            >
              {isSelected && (
                <rect
                  x={-8}
                  y={-24}
                  width={300}
                  height={32}
                  fill="none"
                  stroke="blue"
                  strokeDasharray="4"
                />
              )}

              <text x={0} y={0} fontSize={24} fill="black">
                {el.content}
              </text>
            </g>
          );
        }


        // ICON ELEMENT
        if (el.type === "icon") {
          const iconDef = ICONS[el.name] ?? ICONS[DEFAULT_ICON];
          const size = el.size ?? 24;
          const half = size / 2;

          return (
            <g
              onMouseDown={(e) => {
                e.stopPropagation();

                const svg = e.currentTarget.ownerSVGElement!;
                const point = getSvgPoint(svg, e.clientX, e.clientY);

                dragRef.current = {
                  id: el.id,
                  startMouseX: point.x,
                  startMouseY: point.y,
                  startX: el.x,
                  startY: el.y,
                };

                selectElement(el.id);
              }}

              key={el.id}
              transform={`translate(${el.x}, ${el.y})`}
              onClick={() => selectElement(el.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Selection box — absolute, unscaled */}
              {isSelected && (
                <rect
                  x={-half}
                  y={-half}
                  width={size}
                  height={size}
                  fill="none"
                  stroke="blue"
                  strokeDasharray="4"
                />
              )}

              {/* SVG icon — normalized */}
              <svg
                x={-half}
                y={-half}
                width={size}
                height={size}
                viewBox={iconDef.viewBox}
                fill="black"
              >
                {iconDef.path}
              </svg>
            </g>
          );
        }




        return null;
      })}
    </svg>
  );
}
