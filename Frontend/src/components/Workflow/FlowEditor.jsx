import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";

const FlowEditor = ({ nodes, setNodes, edges, setEdges }) => {
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);
  const [_, onNodesChange] = useNodesState(nodes);
  const [__, onEdgesChange] = useEdgesState(edges);

  const onConnect = useCallback((connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const bounds = event.target.getBoundingClientRect();
    const data = JSON.parse(event.dataTransfer.getData("application/reactflow"));
    if (!data) return;

    const position = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    const newNode = {
      id: `${+new Date()}`,
      type: data.type,
      position,
      data: { label: data.label, onDelete: handleDeleteNode },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleDeleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const handleDeleteKey = useCallback((event) => {
    if (event.key === "Delete" || event.key === "Backspace") {
      setNodes((nds) => nds.filter((node) => !node.selected));
      setEdges((eds) => eds.filter((edge) => !edge.selected));
    }
  }, [setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <div className="flex-1 h-full" tabIndex={0} onKeyDown={handleDeleteKey}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-orange-50"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default FlowEditor;
