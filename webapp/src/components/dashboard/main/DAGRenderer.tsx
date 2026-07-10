import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { usePlan } from "../../../context/PlanContext";
import { PillVariant } from "../../../hooks/useStatusStyles";
import { calculateLevels } from "./dag/dagUtils";
import ZoomControls from "./dag/ZoomControls";
import DAGCanvas from "./dag/DAGCanvas";
import ContextMenu from "../../ui/ContextMenu";
import { deleteSubject } from "../../../api/plans";
import { useError } from "../../../context/ErrorContext";
import { useDAGCanvasInteraction } from "./dag/useDAGCanvasInteraction";
import EditSubjectModal from "../../plan/EditSubjectModal";
import { SubjectDetailResponse } from "../../../types/plan";

export interface DAGRendererRef {
  exportPNG: () => void;
}

interface DAGRendererProps {
  isFullscreen?: boolean;
  hoveredLegendStatus?: "completed" | "ready" | "blocked" | null;
}

const DAGRenderer = forwardRef<DAGRendererRef, DAGRendererProps>(
  ({ isFullscreen = false, hoveredLegendStatus = null }, ref) => {
    const { subjects, activePlanId, refreshPlans, refreshDetails } = usePlan();
    const { showError } = useError();
    const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, subjectId: string } | null>(null);
    const [editingSubject, setEditingSubject] = useState<SubjectDetailResponse | null>(null);

    const { zoom, setZoom, handleMouseDown, isDragging } = useDAGCanvasInteraction(
      containerNode,
      () => setContextMenu(null)
    );

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setContextMenu(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
      if (!containerNode) return;
      const handleScroll = () => {
        setContextMenu(null);
      };
      containerNode.addEventListener("scroll", handleScroll);
      return () => {
        containerNode.removeEventListener("scroll", handleScroll);
      };
    }, [containerNode]);

    useEffect(() => {
      const handleGlobalClick = () => {
        setContextMenu(null);
      };
      window.addEventListener("mousedown", handleGlobalClick);
      window.addEventListener("contextmenu", handleGlobalClick);
      return () => {
        window.removeEventListener("mousedown", handleGlobalClick);
        window.removeEventListener("contextmenu", handleGlobalClick);
      };
    }, []);

    useEffect(() => {
      setContextMenu(null);
    }, [isFullscreen]);

    const nodeWidth = isFullscreen ? 260 : 180;
    const nodeHeight = isFullscreen ? 76 : 52;
    const colGap = isFullscreen ? 360 : 320;
    const rowGap = isFullscreen ? 160 : 140;

    const displaySubjects = subjects;

    const handleContainerClick = useCallback(() => {
      if (!isDragging.current) {
        setSelectedId(null);
        setContextMenu(null);
      }
    }, [isDragging]);

    const statusColors = {
      completed: {
        fill: "var(--color-status-completed-bg)",
        stroke: "var(--color-status-completed-border)",
        text: "var(--color-status-completed-text)",
      },
      ready: {
        fill: "var(--color-status-ready-bg)",
        stroke: "var(--color-status-ready-border)",
        text: "var(--color-blue-soft)",
      },
      blocked: {
        fill: "var(--color-status-blocked-bg)",
        stroke: "var(--color-status-blocked-border)",
        text: "var(--color-status-blocked-text)",
      },
    };

    const { nodes, edges, svgWidth, svgHeight } = useMemo(() => {
      if (!displaySubjects || displaySubjects.length === 0) {
        return { nodes: [], edges: [], svgWidth: 0, svgHeight: 0 };
      }

      const { levels, subjectByName } = calculateLevels(displaySubjects);
      const levelCounts: Record<number, number> = {};

      const generatedNodes = displaySubjects.map((subject) => {
        const column = levels[subject.id] || 0;
        const row = levelCounts[column] || 0;
        levelCounts[column] = row + 1;

        return {
          id: String(subject.id),
          label: subject.name,
          classroom: subject.classroom,
          status: subject.status as PillVariant,
          x: column * colGap + 24,
          y: row * rowGap + 100
        };
      });

      const nodePositionMap = new Map(generatedNodes.map(n => [n.id, n]));
      const generatedEdges: { id: string; path: string; status: PillVariant; source: string; target: string }[] = [];

      displaySubjects.forEach((subject) => {
        if (subject.dependents) {
          subject.dependents.forEach((depName) => {
            const childSubject = subjectByName.get(depName);
            if (childSubject) {
              const sourceNode = nodePositionMap.get(String(subject.id));
              const targetNode = nodePositionMap.get(String(childSubject.id));

              if (sourceNode && targetNode) {
                const x1 = sourceNode.x + nodeWidth;
                const y1 = sourceNode.y + nodeHeight / 2;
                const x2 = targetNode.x;
                const y2 = targetNode.y + nodeHeight / 2;

                const sourceCol = levels[subject.id] || 0;
                const targetCol = levels[childSubject.id] || 0;
                const colDelta = targetCol - sourceCol;

                generatedEdges.push({
                  id: `e-${subject.id}-${childSubject.id}`,
                  path: generateEdgePath(x1, y1, x2, y2, colDelta),
                  status: childSubject.status as PillVariant,
                  source: String(subject.id),
                  target: String(childSubject.id)
                });
              }
            }
          });
        }
      });

      const maxX = generatedNodes.length > 0 ? Math.max(...generatedNodes.map(n => n.x)) + nodeWidth : 800;
      const maxY = generatedNodes.length > 0 ? Math.max(...generatedNodes.map(n => n.y)) + nodeHeight : 600;

      return {
        nodes: generatedNodes,
        edges: generatedEdges,
        svgWidth: maxX + 40,
        svgHeight: maxY + 40
      };
    }, [displaySubjects, nodeWidth, nodeHeight, colGap, rowGap]);

    useEffect(() => {
      if (!selectedId || !containerNode) return;
      const selectedNode = nodes.find((n) => n.id === selectedId);
      if (!selectedNode) return;

      const centerX = (selectedNode.x + nodeWidth / 2) * zoom;
      const centerY = (selectedNode.y + nodeHeight / 2) * zoom;

      const targetLeft = centerX - containerNode.clientWidth / 2;
      const targetTop = centerY - containerNode.clientHeight / 2;

      containerNode.scrollTo({
        left: Math.max(0, targetLeft),
        top: Math.max(0, targetTop),
        behavior: "smooth"
      });
    }, [selectedId, zoom, containerNode, nodes, nodeWidth, nodeHeight]);

    useImperativeHandle(ref, () => ({
      exportPNG() {
        const svgElement = containerNode?.querySelector("svg");
        if (!svgElement) return;

        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = svgWidth * zoom;
          canvas.height = svgHeight * zoom;

          const context = canvas.getContext("2d");
          if (context) {
            context.fillStyle = "#09090b";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);

            const pngURL = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngURL;
            downloadLink.download = "topic-dependency-graph.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          }
          URL.revokeObjectURL(blobURL);
        };
        image.src = blobURL;
      }
    }));

    const activeId = selectedId || hoveredId;

    const connectedIds = useMemo(() => {
      if (!activeId) return new Set<string>();
      const ids = new Set<string>();
      edges.forEach((edge) => {
        if (edge.source === activeId) {
          ids.add(edge.target);
        }
        if (edge.target === activeId) {
          ids.add(edge.source);
        }
      });
      return ids;
    }, [activeId, edges]);

    if (!displaySubjects || displaySubjects.length === 0) {
      return (
        <div className="flex-1 w-full h-full flex items-center justify-center text-sec font-mono text-[11px] min-h-[300px]">
          No subjects available in this plan. Add some subjects to build the graph.
        </div>
      );
    }

    return (
      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
        <div
          ref={setContainerNode}
          onMouseDown={handleMouseDown}
          onClick={handleContainerClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
          className="flex-1 w-full h-full overflow-auto select-none p-2"
          style={{ cursor: "grab" }}
        >
          <DAGCanvas
            nodes={nodes}
            edges={edges}
            svgWidth={svgWidth}
            svgHeight={svgHeight}
            zoom={zoom}
            nodeWidth={nodeWidth}
            nodeHeight={nodeHeight}
            activeId={activeId}
            selectedId={selectedId}
            connectedIds={connectedIds}
            onNodeClick={(id) => {
              setSelectedId(selectedId === id ? null : id);
              setContextMenu(null);
            }}
            onNodeMouseEnter={(id) => setHoveredId(id)}
            onNodeMouseLeave={() => setHoveredId(null)}
            onBackgroundClick={() => {
              setSelectedId(null);
              setContextMenu(null);
            }}
            onNodeContextMenu={(id, x, y) => {
              setContextMenu({ subjectId: id, x, y });
            }}
            hoveredLegendStatus={hoveredLegendStatus}
            statusColors={statusColors}
            isFullscreen={isFullscreen}
            displaySubjects={displaySubjects}
            onCloseCard={() => setSelectedId(null)}
          />
        </div>

        <ZoomControls
          zoom={zoom}
          onZoomIn={() => {
            setZoom(z => Math.min(1.75, z + 0.1));
            setContextMenu(null);
          }}
          onZoomOut={() => {
            setZoom(z => Math.max(0.5, z - 0.1));
            setContextMenu(null);
          }}
          onReset={() => {
            setZoom(1);
            setContextMenu(null);
          }}
        />

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            items={[
              {
                label: "Edit",
                onClick: () => {
                  const sub = subjects.find(s => String(s.id) === contextMenu.subjectId);
                  if (sub) {
                    setEditingSubject(sub);
                  }
                }
              },
              {
                label: "Delete",
                variant: "danger",
                onClick: async () => {
                  if (!activePlanId) return;
                  const subjectId = Number(contextMenu.subjectId);
                  try {
                    await deleteSubject(activePlanId, subjectId);
                    await refreshPlans();
                    await refreshDetails();
                  } catch (error: any) {
                    const backendError = error.response?.data?.detail;
                    showError(backendError || "Failed to delete subject.");
                  }
                }
              }
            ]}
          />
        )}

        {editingSubject && (
          <EditSubjectModal
            subject={editingSubject}
            onClose={() => setEditingSubject(null)}
          />
        )}
      </div>
    );
  }
);

export default DAGRenderer;

function generateEdgePath(x1: number, y1: number, x2: number, y2: number, colDelta: number): string {
  if (colDelta > 1) {
    const cp1x = x1 + (x2 - x1) * 0.75;
    const cp1y = y1;
    const cp2x = x2 - 80;
    const cp2y = y2;
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  } else {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  }
}