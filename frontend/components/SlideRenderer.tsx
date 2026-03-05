import { Slide } from "@/types/slide";
import { useEditorStore } from "@/store/editorStore";
import { ICONS, DEFAULT_ICON } from "./icons";
import { useRef } from "react";

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
  const {
    selectedElementId,
    editingElementId,
    selectElement,
    setEditingElement,
    updateElementPosition,
    updateElementContent,
  } = useEditorStore();

  const dragRef = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
  } | null>(null);

  return (
    <svg
      width={800}
      height={450}
      viewBox="0 0 800 450"
      style={{ border: "1px solid #ccc", background: "white" }}
      onMouseDown={() => {
        // boş alana tıklandı → selection temizle
        selectElement(null);
      }}
      onMouseMove={(e) => {
        if (!dragRef.current || editingElementId) return;

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
        const isEditing = el.id === editingElementId;

        // ======================
        // TEXT ELEMENT
        // ======================
        if (el.type === "text") {
          return (
            <g
              key={el.id}
              transform={`translate(${el.x}, ${el.y})`}
              style={{ cursor: isEditing ? "text" : "pointer" }}
              onMouseDown={(e) => {
                if (isEditing) return; // Edit yaparken sürüklemeyi kapat
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
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingElement(el.id);
              }}
            >
              {isSelected && !isEditing && (
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

              {isEditing ? (
                <foreignObject x={-8} y={-24} width={400} height={100}>
                  <textarea
                    autoFocus
                    defaultValue={el.content}
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: "24px",
                      border: "1px solid blue",
                      outline: "none",
                      background: "white",
                      resize: "none",
                      fontFamily: "inherit",
                    }}
                    onBlur={(e) => {
                      updateElementContent(el.id, e.target.value);
                      setEditingElement(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                  />
                </foreignObject>
              ) : (
                <text x={0} y={0} fontSize={24} fill="black">
                  {el.content}
                </text>
              )}
            </g>
          );
        }

        // ======================
        // ICON ELEMENT
        // ======================
        if (el.type === "icon") {
          const iconDef = ICONS[el.name] ?? ICONS[DEFAULT_ICON];
          const size = el.size ?? 24;
          const half = size / 2;

          return (
            <g
              key={el.id}
              transform={`translate(${el.x}, ${el.y})`}
              style={{ cursor: "pointer" }}
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
            >
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
