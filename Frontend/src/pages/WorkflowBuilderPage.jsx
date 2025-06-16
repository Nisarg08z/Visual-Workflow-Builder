import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import { useNavigate } from 'react-router-dom';
import {
  createWorkflowApi,
  getWorkflowByIdApi,
  updateWorkflowApi,
} from '../utils/api';
import { UserContext } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';

const initialNodes = [
  { id: '1', type: 'input', data: { label: 'Input Node' }, position: { x: 250, y: 50 } },
  { id: '2', type: 'default', data: { label: 'Process Node' }, position: { x: 250, y: 200 } },
  { id: '3', type: 'output', data: { label: 'Output Node' }, position: { x: 250, y: 350 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

const WorkflowBuilderPage = () => {
  const navigate = useNavigate();
  const { isLogedin, userDetail } = useContext(UserContext);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [workflowName, setWorkflowName] = useState('');
  const [description, setDescription] = useState('');
  const [workflowId, setWorkflowId] = useState(null);
  const [loading, setLoading] = useState(false);

  const nameInputRef = useRef(null);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleSaveWorkflow = async () => {
    if (!isLogedin || !userDetail) {
      toast.error('You must be logged in to save a workflow.');
      navigate('/login');
      return;
    }
    if (!workflowName.trim()) {
      toast.error('Workflow name cannot be empty.');
      return;
    }
    if (nodes.length === 0 || edges.length === 0) {
      toast.error('Workflow must have nodes and edges.');
      return;
    }

    setLoading(true);
    const workflowData = {
      workflowName,
      description,
      nodes,
      edges,
    };

    try {
      let response;
      if (workflowId) {
        response = await updateWorkflowApi(workflowId, workflowData);
        toast.success(response.message || 'Workflow updated!');
      } else {
        response = await createWorkflowApi(workflowData);
        setWorkflowId(response.data._id);
        toast.success(response.message || 'Workflow saved!');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save workflow.');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflow = useCallback(async (id) => {
    if (!isLogedin || !userDetail) {
      toast.error('You must be logged in to load a workflow.');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await getWorkflowByIdApi(id);
      if (response.success) {
        const workflow = response.data;
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        setWorkflowName(workflow.workflowName);
        setDescription(workflow.description);
        setWorkflowId(workflow._id);
        toast.success('Workflow loaded!');
      } else {
        toast.error(response.message || 'Failed to load.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load workflow.');
    } finally {
      setLoading(false);
    }
  }, [isLogedin, userDetail, navigate, setNodes, setEdges]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) loadWorkflow(id);
  }, [loadWorkflow]);

  const handleCreateNewBlankWorkflow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setWorkflowName('');
    setDescription('');
    setWorkflowId(null);
    toast('Started a new blank workflow!', { icon: '✨' });

    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-100">
      <div className="bg-white shadow-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-blue-700">Workflow Builder</h1>

        <div className="flex flex-col sm:flex-row gap-2 flex-grow sm:flex-grow-0 sm:w-auto w-full">
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Workflow Name"
            className="p-2 border rounded-md text-sm w-full sm:w-auto"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Description (Optional)"
            className="p-2 border rounded-md text-sm w-full sm:w-auto"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button onClick={handleCreateNewBlankWorkflow} type="secondary" disabled={loading}>
            <i className="fas fa-file-alt mr-2"></i> New Blank
          </Button>
          <Button onClick={handleSaveWorkflow} disabled={loading}>
            <i className="fas fa-save mr-2"></i> {workflowId ? 'Update' : 'Save'} Workflow
          </Button>
          <Button onClick={() => navigate('/workflow-history')} type="info" disabled={loading}>
            <i className="fas fa-history mr-2"></i> History
          </Button>
          <Button onClick={() => navigate('/')} type="secondary" disabled={loading}>
            <i className="fas fa-home mr-2"></i> Home
          </Button>
        </div>
      </div>

      <div style={{ flexGrow: 1, height: 'calc(100vh - 130px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowBuilderPage;
