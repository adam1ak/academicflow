import { useState, useEffect, useRef } from "react";

export function useDAGCanvasInteraction(
  containerNode: HTMLDivElement | null,
  onInteraction: () => void
) {
  const [zoom, setZoom] = useState<number>(1);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!containerNode) return;

    const handleWheelRaw = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomFactor = 0.05;
        const direction = e.deltaY < 0 ? 1 : -1;
        setZoom((prevZoom) => {
          const newZoom = prevZoom + direction * zoomFactor;
          return Math.max(0.5, Math.min(1.75, newZoom));
        });
      }
    };

    containerNode.addEventListener("wheel", handleWheelRaw, { passive: false });
    return () => {
      containerNode.removeEventListener("wheel", handleWheelRaw);
    };
  }, [containerNode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerNode;
    if (!container) return;
    if (e.button !== 0) return;

    isDragging.current = false;
    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
    onInteraction();

    const startX = e.pageX;
    const startY = e.pageY;
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.pageX - startX;
      const dy = moveEvent.pageY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDragging.current = true;
      }
      container.scrollLeft = scrollLeft - dx * 1.5;
      container.scrollTop = scrollTop - dy * 1.5;
    };

    const handleMouseUp = () => {
      container.style.cursor = "grab";
      container.style.removeProperty("user-select");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return {
    zoom,
    setZoom,
    handleMouseDown,
    isDragging
  };
}
