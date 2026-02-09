import { Slide } from "@/types/slide"

type Props = {
    slide: Slide;
};

export default function SlideRenderer({ slide }: Props) {
  return (
    <svg width={800} height={450} style={{ border: "1px solid #ccc" }}>
      {slide.elements.map((el) => {
        if (el.type === "text") {
          return (
            <text
              key={el.id}
              x={el.x}
              y={el.y}
              fontSize={24}
              fill="black"
            >
              {el.content}
            </text>
          );
        }

        if (el.type === "icon") {
          return (
            <circle
              key={el.id}
              cx={el.x}
              cy={el.y}
              r={el.size}
              fill="gray"
            />
          );
        }

        return null;
      })}
    </svg>
  );
}