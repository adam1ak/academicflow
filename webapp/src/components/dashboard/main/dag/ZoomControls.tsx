interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-surface-hi/80 backdrop-blur-md border border-dim rounded-lg p-1 px-2 shadow-lg">
      <button 
        onClick={onZoomOut}
        className="w-6 h-6 flex items-center justify-center text-sec hover:text-pri hover:bg-dim/50 rounded cursor-pointer transition-colors text-xs font-mono select-none bg-transparent border-0 outline-none"
      >
        -
      </button>
      <span className="text-[10px] font-mono font-bold text-sec w-10 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <button 
        onClick={onReset}
        className="text-[9px] font-mono font-bold bg-dim/30 hover:bg-dim/60 text-pri px-2 py-0.5 rounded cursor-pointer transition-colors border-0 outline-none select-none"
      >
        Reset
      </button>
      <button 
        onClick={onZoomIn}
        className="w-6 h-6 flex items-center justify-center text-sec hover:text-pri hover:bg-dim/50 rounded cursor-pointer transition-colors text-xs font-mono select-none bg-transparent border-0 outline-none"
      >
        +
      </button>
    </div>
  );
}
