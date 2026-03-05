import { Slide } from "@/types/slide";
import { useEditorStore } from "@/store/editorStore";
import { ICONS, DEFAULT_ICON } from "./icons";
import { useRef, useState } from "react";

type Props = {
  slide: Slide;
};

type HandleType = "tl" | "tr" | "bl" | "br";

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
    duplicateElement,
    copyElement,
    cutElement,
    moveElementLayer,
    updateElementPosition,
    updateElementTransform,
    updateElementContent,
  } = useEditorStore();

  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);

  const dragRef = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const resizeRef = useRef<{
    id: string;
    handle: HandleType;
    fixedX: number;
    fixedY: number;
  } | null>(null);

  return (
    <svg
      width={800}
      height={450}
      viewBox="0 0 800 450"
      className="bg-white border border-gray-300 shadow-sm"
      onMouseDown={() => selectElement(null)}
      onMouseMove={(e) => {
        const svg = e.currentTarget;
        const point = getSvgPoint(svg, e.clientX, e.clientY);

        if (dragRef.current && !editingElementId) {
          const dx = point.x - dragRef.current.startMouseX;
          const dy = point.y - dragRef.current.startMouseY;
          updateElementPosition(dragRef.current.id, dragRef.current.startX + dx, dragRef.current.startY + dy);
        } else if (resizeRef.current) {
          const { fixedX, fixedY, id } = resizeRef.current;
          let newX = Math.min(point.x, fixedX);
          let newY = Math.min(point.y, fixedY);
          let newW = Math.max(10, Math.abs(point.x - fixedX));
          let newH = Math.max(10, Math.abs(point.y - fixedY));
          updateElementTransform(id, newX, newY, newW, newH);
        }
      }}
      onMouseUp={() => { dragRef.current = null; resizeRef.current = null; }}
      onMouseLeave={() => { dragRef.current = null; resizeRef.current = null; }}
    >
      {slide.elements.map((el) => {
        const isSelected = el.id === selectedElementId;
        const isEditing = el.id === editingElementId;

        const width = el.type === "text" ? (el.width ?? 300) : el.size;
        const height = el.type === "text" ? (el.height ?? 32) : el.size;

        const offsetX = el.type === "icon" ? 0 : -8;
        const offsetY = el.type === "icon" ? 0 : -24;

        const boxX = el.x + offsetX;
        const boxY = el.y + offsetY;

        const renderHandle = (type: HandleType, cx: number, cy: number, fixedX: number, fixedY: number) => {
          const handleId = `${el.id}-${type}`;
          const isHovered = hoveredHandle === handleId;
          return (
            <circle
              cx={cx}
              cy={cy}
              r={6}
              fill="white"
              stroke={isHovered ? "#f97316" : "#3b82f6"}
              strokeWidth={2}
              style={{ cursor: type === "tl" || type === "br" ? "nwse-resize" : "nesw-resize" }}
              onMouseEnter={() => setHoveredHandle(handleId)}
              onMouseLeave={() => setHoveredHandle(null)}
              onMouseDown={(e) => {
                e.stopPropagation();
                resizeRef.current = { id: el.id, handle: type, fixedX, fixedY };
              }}
            />
          );
        };

        const Toolbar = isSelected && !isEditing && (
          <foreignObject x={boxX} y={boxY - 45} width={280} height={40}>
            <div className="flex items-center bg-gray-800 text-white rounded-md shadow-lg px-1 py-1 space-x-1 border border-gray-600">
              <button onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }} className="p-1 hover:bg-red-600 rounded transition-colors" title="Delete">🗑️</button>
              <button onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }} className="p-1 hover:bg-gray-600 rounded transition-colors" title="Duplicate">👯</button>
              <button onClick={(e) => { e.stopPropagation(); copyElement(el.id); }} className="p-1 hover:bg-gray-600 rounded transition-colors" title="Copy">📋</button>
              <button onClick={(e) => { e.stopPropagation(); cutElement(el.id); }} className="p-1 hover:bg-gray-600 rounded transition-colors" title="Cut">✂️</button>
              <div className="w-px h-4 bg-gray-600 mx-1"></div>
              <button onClick={(e) => { e.stopPropagation(); moveElementLayer(el.id, "up"); }} className="p-1 hover:bg-gray-600 rounded transition-colors" title="Bring Forward">🔼</button>
              <button onClick={(e) => { e.stopPropagation(); moveElementLayer(el.id, "down"); }} className="p-1 hover:bg-gray-600 rounded transition-colors" title="Send Backward">🔽</button>
              <button onClick={(e) => { e.stopPropagation(); moveElementLayer(el.id, "front"); }} className="p-1 hover:bg-gray-600 rounded transition-colors text-xs px-2" title="Bring to Front">Front</button>
            </div>
          </foreignObject>
        );

        const Controls = isSelected && !isEditing && (
          <g>
            <rect x={boxX} y={boxY} width={width} height={height} fill="none" stroke="#3b82f6" strokeDasharray="4" pointerEvents="none" />
            {renderHandle("tl", boxX, boxY, boxX + width, boxY + height)}
            {renderHandle("tr", boxX + width, boxY, boxX, boxY + height)}
            {renderHandle("bl", boxX, boxY + height, boxX + width, boxY)}
            {renderHandle("br", boxX + width, boxY + height, boxX, boxY)}
            {Toolbar}
          </g>
        );

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
                  dragRef.current = { id: el.id, startMouseX: point.x, startMouseY: point.y, startX: el.x, startY: el.y };
                  selectElement(el.id);
                }}
                onDoubleClick={(e) => { e.stopPropagation(); setEditingElement(el.id); }}
              >
                {isEditing ? (
                  <foreignObject x={offsetX} y={offsetY} width={width} height={height + 100}>
                    <textarea
                      autoFocus
                      defaultValue={el.content}
                      className="w-full h-full text-2xl border border-blue-500 outline-none bg-white resize-none font-inherit p-1"
                      onBlur={(e) => { updateElementContent(el.id, e.target.value); setEditingElement(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.blur(); } }}
                    />
                  </foreignObject>
                ) : (
                  <text x={0} y={0} fontSize={24} fill="black">{el.content}</text>
                )}
              </g>
              {Controls}
            </g>
          );
        }

        if (el.type === "icon") {
          const iconDef = ICONS[el.name] ?? ICONS[DEFAULT_ICON];
          return (
            <g key={el.id}>
              <g
                transform={`translate(${el.x}, ${el.y})`}
                style={{ cursor: "pointer" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const svg = e.currentTarget.ownerSVGElement!;
                  const point = getSvgPoint(svg, e.clientX, e.clientY);
                  dragRef.current = { id: el.id, startMouseX: point.x, startMouseY: point.y, startX: el.x, startY: el.y };
                  selectElement(el.id);
                }}
              >
                <svg x={0} y={0} width={el.size} height={el.size} viewBox={iconDef.viewBox} fill="black">
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
