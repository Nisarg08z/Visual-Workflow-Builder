import React from "react";
import ReactFlow, {
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 250, y: 0 },
    draggable: false,
    style: {
      background: "#fef3c7",
      color: "#92400e",
      fontWeight: "bold",
      padding: 10,
      borderRadius: 10,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },
  {
    id: "2",
    data: { label: "Fetch Data" },
    position: { x: 100, y: 100 },
    draggable: false,
    style: {
      background: "#f3f4f6",
      color: "#111827",
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      padding: 8,
    },
  },
  {
    id: "3",
    data: { label: "Process" },
    position: { x: 400, y: 100 },
    draggable: false,
    style: {
      background: "#f3f4f6",
      color: "#111827",
      border: "1px solid #cbd5e1",
      borderRadius: 8,
      padding: 8,
    },
  },
  {
    id: "4",
    type: "output",
    data: { label: "Result" },
    position: { x: 250, y: 200 },
    draggable: false,
    style: {
      background: "#d1fae5",
      color: "#065f46",
      fontWeight: "bold",
      padding: 10,
      borderRadius: 10,
    },
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#f59e0b" } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#f59e0b" } },
  { id: "e2-4", source: "2", target: "4", style: { stroke: "#10b981" } },
  { id: "e3-4", source: "3", target: "4", style: { stroke: "#10b981" } },
];

const WorkflowPreview = () => {
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <section className="flex flex-col items-center gap-8 py-20 px-4 bg-white text-black">
      <h2 className="text-4xl font-bold text-orange-500">
        How It Works
      </h2>

      <div className="w-[800px] max-w-7xl h-[600px] border rounded-2xl shadow-xl overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnScroll={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <MiniMap
            nodeColor={(node) =>
              node.type === "input"
                ? "#fbbf24"
                : node.type === "output"
                ? "#10b981"
                : "#94a3b8"
            }
            nodeStrokeWidth={2}
            zoomable={false}
            pannable={false}
          />
          <Background gap={16} color="#d1d5db" />
        </ReactFlow>
      </div>
    </section>
  );
};

export default WorkflowPreview;
