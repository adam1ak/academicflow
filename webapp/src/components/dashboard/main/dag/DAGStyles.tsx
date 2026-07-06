export default function DAGStyles() {
  return (
    <style>{`
      svg {
        --color-status-completed-bg: rgba(5, 46, 22, 0.8);
        --color-status-completed-border: #16a34a;
        --color-status-completed-text: #4ade80;
        --color-status-ready-bg: rgba(30, 41, 59, 0.8);
        --color-status-ready-border: #3b82f6;
        --color-blue-soft: #60a5fa;
        --color-status-blocked-bg: rgba(20, 20, 26, 0.8);
        --color-status-blocked-border: #2d2d35;
        --color-status-blocked-text: #52525b;
        --color-accent-green: #22c55e;
        font-family: Inter, system-ui, -apple-system, sans-serif;
      }
      text {
        font-family: Inter, system-ui, -apple-system, sans-serif;
      }
      text.classroom-text {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      }
      @keyframes ready-flow {
        0% { stroke: #3b82f6; }
        50% { stroke: #60a5fa; }
        100% { stroke: #3b82f6; }
      }
      @keyframes ready-arrow-flow {
        0% { fill: #3b82f6; }
        50% { fill: #60a5fa; }
        100% { fill: #3b82f6; }
      }
      @keyframes done-flow {
        0% { stroke: var(--color-status-completed-border); }
        50% { stroke: #22c55e; }
        100% { stroke: var(--color-status-completed-border); }
      }
      @keyframes done-arrow-flow {
        0% { fill: var(--color-status-completed-border); }
        50% { fill: #22c55e; }
        100% { fill: var(--color-status-completed-border); }
      }
      @keyframes blocked-flow {
        0% { stroke: var(--color-status-blocked-border); }
        50% { stroke: #71717a; }
        100% { stroke: var(--color-status-blocked-border); }
      }
      @keyframes blocked-arrow-flow {
        0% { fill: var(--color-status-blocked-border); }
        50% { fill: #71717a; }
        100% { fill: var(--color-status-blocked-border); }
      }
      .animate-ready-flow {
        animation: ready-flow 3s ease-in-out infinite;
      }
      .animate-ready-arrow {
        animation: ready-arrow-flow 3s ease-in-out infinite;
      }
      .animate-done-flow {
        animation: done-flow 3s ease-in-out infinite;
      }
      .animate-done-arrow {
        animation: done-arrow-flow 3s ease-in-out infinite;
      }
      .animate-blocked-flow {
        animation: blocked-flow 3s ease-in-out infinite;
      }
      .animate-blocked-arrow {
        animation: blocked-arrow-flow 3s ease-in-out infinite;
      }
    `}</style>
  );
}
