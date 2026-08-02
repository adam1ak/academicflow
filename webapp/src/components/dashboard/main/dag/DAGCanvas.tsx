import { useMemo } from "react";
import { SubjectDetailResponse } from "../../../../types/plan";
import DAGStyles from "./DAGStyles";

interface DAGCanvasProps {
  nodes: any[];
  edges: any[];
  svgWidth: number;
  svgHeight: number;
  zoom: number;
  nodeWidth: number;
  nodeHeight: number;
  activeId: string | null;
  selectedId: string | null;
  connectedIds: Set<string>;
  onNodeClick: (id: string) => void;
  onNodeMouseEnter: (id: string) => void;
  onNodeMouseLeave: () => void;
  onBackgroundClick: () => void;
  onNodeContextMenu: (id: string, x: number, y: number) => void;
  hoveredLegendStatus: "completed" | "ready" | "blocked" | null;
  statusColors: any;
  isFullscreen: boolean;
  displaySubjects: SubjectDetailResponse[];
  onCloseCard: () => void;
}

export default function DAGCanvas({
  nodes,
  edges,
  svgWidth,
  svgHeight,
  zoom,
  nodeWidth,
  nodeHeight,
  activeId,
  selectedId,
  connectedIds,
  onNodeClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onBackgroundClick,
  onNodeContextMenu,
  hoveredLegendStatus,
  statusColors,
  isFullscreen,
  displaySubjects,
  onCloseCard
}: DAGCanvasProps) {
  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;
  const selectedSubject = selectedId ? displaySubjects.find((s) => String(s.id) === selectedId) : null;
  const selectedColors = selectedSubject ? (statusColors[selectedSubject.status as keyof typeof statusColors] || statusColors.ready) : null;

  const cardWidth = isFullscreen ? 260 : 210;
  const cardHeight = isFullscreen ? 68 : 58;
  const tx = selectedNode
    ? Math.max(8, Math.min(svgWidth - cardWidth - 8, selectedNode.x + nodeWidth / 2 - cardWidth / 2))
    : 0;
  const ty = selectedNode ? selectedNode.y - cardHeight - 12 : 0;

  const isNodeDimmed = useMemo(() => {
    return (nodeId: string, nodeStatus: string) => {
      if (activeId) {
        return activeId !== nodeId && !connectedIds.has(nodeId);
      }
      if (hoveredLegendStatus) {
        return nodeStatus !== hoveredLegendStatus;
      }
      return false;
    };
  }, [activeId, connectedIds, hoveredLegendStatus]);

  const isEdgeDimmed = useMemo(() => {
    return (edgeSource: string, edgeTarget: string, edgeStatus: string) => {
      if (activeId) {
        return edgeSource !== activeId && edgeTarget !== activeId;
      }
      if (hoveredLegendStatus) {
        return edgeStatus !== hoveredLegendStatus;
      }
      return false;
    };
  }, [activeId, hoveredLegendStatus]);

  const isEdgeHighlighted = useMemo(() => {
    return (edgeSource: string, edgeTarget: string) => {
      if (activeId) {
        return edgeSource === activeId || edgeTarget === activeId;
      }
      return false;
    };
  }, [activeId]);

  return (
    <svg
      width={svgWidth * zoom}
      height={svgHeight * zoom}
      style={{ display: "block" }}
      onClick={onBackgroundClick}
    >
      <DAGStyles />

      <defs>
        <marker
          id="arrow-done"
          markerWidth="5"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L0,5 L5,2.5 z" fill="var(--color-status-completed-border)" />
        </marker>
        <marker
          id="arrow-ready"
          markerWidth="5"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L0,5 L5,2.5 z" fill="var(--color-status-ready-border)" />
        </marker>
        <marker
          id="arrow-blocked"
          markerWidth="5"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L0,5 L5,2.5 z" fill="var(--color-status-blocked-border)" fillOpacity="0.5" />
        </marker>

        <marker
          id="arrow-done-active"
          markerWidth="5"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L0,5 L5,2.5 z" className="animate-done-arrow" />
        </marker>
        <marker
          id="arrow-ready-active"
          markerWidth="5"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L0,5 L5,2.5 z" className="animate-ready-arrow" />
        </marker>
        <marker
          id="arrow-blocked-active"
          markerWidth="5"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L0,5 L5,2.5 z" className="animate-blocked-arrow" />
        </marker>
      </defs>

      <g transform={`scale(${zoom})`}>
        <g id="dag-edges">
          {edges.map((edge) => {
            const colors = statusColors[edge.status as keyof typeof statusColors] || statusColors.ready;
            const isHi = isEdgeHighlighted(edge.source, edge.target);
            const isDim = isEdgeDimmed(edge.source, edge.target, edge.status);

            let animationClass = "";
            if (isHi) {
              if (edge.status === "completed") animationClass = "animate-done-flow";
              else if (edge.status === "ready") animationClass = "animate-ready-flow";
              else animationClass = "animate-blocked-flow";
            }

            const markerId = edge.status === "completed" ? "done" : edge.status;
            const activeSuffix = isHi ? "-active" : "";

            return (
              <path
                key={edge.id}
                d={edge.path}
                fill="none"
                strokeDasharray={edge.status === "blocked" && !isHi ? "5,4" : undefined}
                style={{
                  stroke: isHi ? undefined : (edge.status === "blocked" ? "var(--color-status-blocked-border)" : colors.stroke),
                  opacity: isDim ? 0.05 : isHi ? 0.95 : (edge.status === "blocked" ? 0.35 : 0.7),
                }}
                className={`transition-all duration-200 ${animationClass}`}
                strokeWidth={isHi ? "2.5" : "2"}
                markerEnd={`url(#arrow-${markerId}${activeSuffix})`}
              />
            );
          })}
        </g>

        <g id="dag-nodes">
          {nodes.map((node) => {
            const colors = statusColors[node.status as keyof typeof statusColors] || statusColors.ready;

            const isSel = activeId === node.id;
            const isConn = connectedIds.has(node.id);
            const isDim = isNodeDimmed(node.id, node.status);

            const classroomColor = node.status === "ready"
              ? "var(--color-status-ready-text)"
              : node.status === "completed"
                ? "var(--color-status-completed-text)"
                : "var(--color-status-blocked-text)";

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick(node.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNodeContextMenu(node.id, e.clientX, e.clientY);
                }}
                onMouseEnter={() => onNodeMouseEnter(node.id)}
                onMouseLeave={onNodeMouseLeave}
                className="cursor-pointer transition-all duration-200"
                style={{
                  opacity: isDim ? 0.15 : 1
                }}
              >
                {activeId && (isSel || isConn) && (
                  <rect
                    x={-5}
                    y={-5}
                    width={nodeWidth + 10}
                    height={nodeHeight + 10}
                    rx="12"
                    fill={colors.stroke}
                    stroke={colors.stroke}
                    strokeWidth="0.5"
                    opacity="0.15"
                    className="transition-all duration-200"
                  />
                )}

                <rect
                  width={nodeWidth}
                  height={nodeHeight}
                  rx="8"
                  strokeWidth={selectedId === node.id ? 1.5 : isConn ? 1.2 : 0.8}
                  style={{
                    fill: colors.fill,
                    stroke: selectedId === node.id ? colors.text : colors.stroke,
                  }}
                />

                <rect
                  width="3"
                  height={nodeHeight}
                  rx="2"
                  style={{
                    fill: colors.stroke,
                  }}
                  opacity="0.9"
                />

                <text
                  x={nodeWidth / 2}
                  y={isFullscreen ? 32 : 22}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  style={{
                    fill: colors.text,
                  }}
                >
                  {node.label}
                </text>

                <text
                  x={nodeWidth / 2}
                  y={isFullscreen ? 56 : 40}
                  textAnchor="middle"
                  fontSize="9"
                  className="classroom-text"
                  style={{
                    fill: classroomColor,
                    opacity: 0.85
                  }}
                >
                  {node.classroom || "No room"}
                </text>
              </g>
            );
          })}
        </g>

        {selectedNode && selectedSubject && selectedColors && (
          <foreignObject
            x={tx}
            y={ty}
            width={cardWidth}
            height={cardHeight}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13131a]/95 border rounded-lg p-2.5 flex flex-col justify-center h-full font-sans text-pri relative shadow-2xl select-none"
              style={{ borderColor: selectedColors.stroke }}
            >
              <button
                aria-label="Close subject details"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseCard();
                }}
                className="absolute top-1.5 right-1.5 text-sec hover:text-pri cursor-pointer text-[9px] bg-transparent border-0 outline-none p-0.5 leading-none"
              >
                ✕
              </button>

              <div className="pr-4 flex flex-col justify-center gap-0.5">
                <div className="font-bold truncate text-[11.5px] sm:text-[12.5px] leading-snug text-pri" title={selectedSubject.name}>{selectedSubject.name}</div>
                <div className="text-[9.5px] font-mono text-sec mt-0.5 uppercase tracking-wider flex items-center gap-1">
                  <span style={{ color: selectedColors.text }}>{selectedSubject.status}</span>
                  <span>·</span>
                  <span>{connectedIds.size} {connectedIds.size === 1 ? "connection" : "connections"}</span>
                </div>
              </div>
            </div>
          </foreignObject>
        )}
      </g>
    </svg>
  );
}
