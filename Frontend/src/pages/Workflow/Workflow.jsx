import React, { useEffect, useState, useCallback } from "react";
import NodeSidebar from "../../components/Workflow/NodeSidebar";
import TopBar from "../../components/Workflow/TopBar";
import FlowEditor from "../../components/Workflow/FlowEditor";
import { useNavigate } from "react-router-dom";
import { createWorkflowApi, getWorkflowByIdApi, updateWorkflowApi, runWorkflowApi } from "../../utils/api";
import toast from "react-hot-toast";

const BuilderPage = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [workflowId, setWorkflowId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Save or update workflow
  const handleSave = async () => {
    if (!workflowName.trim()) return toast.error("Workflow name is required.");
    if (nodes.length === 0 || edges.length === 0) return toast.error("Add some nodes and edges.");

    const data = { workflowName, description, nodes, edges };
    setLoading(true);
    try {
      let response;
      if (workflowId) {
        response = await updateWorkflowApi(workflowId, data);
        toast.success(response.message || "Workflow updated!");
      } else {
        response = await createWorkflowApi(data);
        setWorkflowId(response.data._id);
        toast.success(response.message || "Workflow saved!");
      }
    } catch (err) {
      toast.error(err.message || "Error saving workflow");
    } finally {
      setLoading(false);
    }
  };

  // Run workflow
  const handleRun = async () => {
    if (!workflowId) return toast.error("Save workflow before running.");
    toast("Running workflow...", { icon: "⚙️" });
    try {
      const response = await runWorkflowApi(workflowId, {
        trigger: "manual",
        timestamp: new Date().toISOString(),
      });
      if (response.success) {
        toast.success(`Execution started: ${response.data.executionId}`);
      } else {
        toast.error(response.message || "Run failed.");
      }
    } catch (err) {
      toast.error(err.message || "Network error");
    }
  };

  // New blank workflow
  const handleNew = () => {
    setWorkflowName("");
    setDescription("");
    setWorkflowId(null);
    setNodes([]);
    setEdges([]);
    toast("New blank workflow created!", { icon: "🆕" });
  };

  // Load workflow from URL param
  const loadWorkflow = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await getWorkflowByIdApi(id);
      if (res.success) {
        const wf = res.data;
        setWorkflowName(wf.workflowName);
        setDescription(wf.description);
        setWorkflowId(wf._id);
        setNodes(wf.nodes);
        setEdges(wf.edges);
        toast.success("Workflow loaded!");
      } else {
        toast.error(res.message || "Failed to load");
      }
    } catch (err) {
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) loadWorkflow(id);
  }, [loadWorkflow]);

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        description={description}
        setDescription={setDescription}
        onSave={handleSave}
        onNew={handleNew}
        onRun={handleRun}
        loading={loading}
      />
      <div className="flex flex-1 overflow-hidden">
        <NodeSidebar />
        <FlowEditor
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
        />
      </div>
    </div>
  );
};

export default BuilderPage;
