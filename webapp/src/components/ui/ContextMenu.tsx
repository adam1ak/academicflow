import { useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + rect.width > screenWidth) {
      adjustedX = screenWidth - rect.width - 8;
    }
    if (y + rect.height > screenHeight) {
      adjustedY = screenHeight - rect.height - 8;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
      className="bg-[#111116]/95 backdrop-blur-md border border-hi/50 rounded-lg shadow-2xl flex flex-col text-[12px] w-28 overflow-hidden select-none animate-[menuFadeIn_0.12s_ease-out] origin-top-left"
    >
      <style>{`
        @keyframes menuFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translate(-2px, -2px);
          }
          to {
            opacity: 1;
            transform: scale(1) translate(0, 0);
          }
        }
      `}</style>
      {items.map((item, idx) => {
        const isDanger = item.variant === "danger";
        return (
          <button
            key={idx}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`px-4 py-2 text-left cursor-pointer transition-all duration-100 outline-none font-medium tracking-wide ${
              isDanger
                ? "text-accent-red hover:bg-accent-red/10"
                : "text-[#f1f5f9] hover:bg-white/[0.08] hover:text-blue-soft"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
