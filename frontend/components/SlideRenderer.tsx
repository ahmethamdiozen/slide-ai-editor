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
    deleteElement,
    updateElementPosition,
    updateElementSize,
    updateElementContent,
  } = useEditorStore();

  const dragRef = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const resizeRef = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startW: number;
    startH: number;
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
        const svg = e.currentTarget;
        const point = getSvgPoint(svg, e.clientX, e.clientY);

        if (dragRef.current && !editingElementId) {
          const dx = point.x - dragRef.current.startMouseX;
          const dy = point.y - dragRef.current.startMouseY;

          updateElementPosition(
            dragRef.current.id,
            dragRef.current.startX + dx,
            dragRef.current.startY + dy
          );
        } else if (resizeRef.current) {
          const dx = point.x - resizeRef.current.startMouseX;
          const dy = point.y - resizeRef.current.startMouseY;

          updateElementSize(
            resizeRef.current.id,
            resizeRef.current.startW + dx,
            resizeRef.current.startH + dy
          );
        }
      }}
      onMouseUp={() => {
        dragRef.current = null;
        resizeRef.current = null;
      }}
      onMouseLeave={() => {
        dragRef.current = null;
        resizeRef.current = null;
      }}
    >
      {slide.elements.map((el) => {
        const isSelected = el.id === selectedElementId;
        const isEditing = el.id === editingElementId;

        // Varsayılan boyutlar
        const width = el.type === "text" ? (el.width ?? 300) : el.size;
        const height = el.type === "text" ? (el.height ?? 32) : el.size;

        // Offsetler
        const offsetX = el.type === "icon" ? -el.size / 2 : -8;
        const offsetY = el.type === "icon" ? -el.size / 2 : -24;

        // ======================
        // SELECTION OVERLAY (Controls)
        // ======================
        const Controls = isSelected && !isEditing && (
          <g transform={`translate(${el.x}, ${el.y})`}>
            {/* Seçim çerçevesi */}
            <rect
              x={offsetX}
              y={offsetY}
              width={width}
              height={height}
              fill="none"
              stroke="blue"
              strokeDasharray="4"
              pointerEvents="none"
            />
            {/* Silme Butonu */}
            <circle
              cx={offsetX + width}
              cy={offsetY}
              r={10}
              fill="red"
              style={{ cursor: "pointer" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                deleteElement(el.id);
              }}
            />
            <text
              x={offsetX + width}
              y={offsetY + 4}
              fontSize={12}
              fill="white"
              textAnchor="middle"
              pointerEvents="none"
            >
              X
            </text>
            {/* Boyutlandırma Kulbu */}
            <rect
              x={offsetX + width - 6}
              y={offsetY + height - 6}
              width={12}
              height={12}
              fill="blue"
              style={{ cursor: "nwse-resize" }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const svg = e.currentTarget.ownerSVGElement!;
                const point = getSvgPoint(svg, e.clientX, e.clientY);

                resizeRef.current = {
                  id: el.id,
                  startMouseX: point.x,
                  startMouseY: point.y,
                  startW: width,
                  startH: height,
                };
              }}
            />
          </g>
        );

        // ======================
        // TEXT ELEMENT
        // ======================
        if (el.type === "text") {
          return (
            <g key={el.id}>
              <g
                transform={`translate(${el.x}, ${el.y})`}
                style={{ cursor: isEditing ? "text" : "pointer" }}
                onMouseDown={(e) => {
                  if (isEditing) return;
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
                {isEditing ? (
                  <foreignObject x={offsetX} y={offsetY} width={width} height={height + 100}>
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
              {Controls}
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
            <g key={el.id}>
              <g
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
              {Controls}
            </g>
          );
        }

        return null;
      })}
    </svg>
  );
}
