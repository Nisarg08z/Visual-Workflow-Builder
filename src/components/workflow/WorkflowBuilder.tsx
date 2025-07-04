import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Settings, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { CustomNode } from './CustomNode';
import { NodePanel } from './NodePanel';
import { ChatBot } from './ChatBot';
import { useWorkflowStore } from '../../store/workflowStore';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Start', 
      type: 'trigger',
      config: {},
      description: 'Workflow entry point'
    },
  },
];

const initialEdges: Edge[] = [];

export const WorkflowBuilder: React.FC = () => {
  const { id: workflowId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showChatBot, setShowChatBot] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  
  const { 
    workflows, 
    currentWorkflow, 
    setCurrentWorkflow, 
    updateWorkflow, 
    createWorkflow,
    executeWorkflow, 
    executionResult 
  } = useWorkflowStore();
  const { user } = useAuthStore();

  // Load workflow data when component mounts or workflowId changes
  useEffect(() => {
    if (workflowId && workflowId !== 'new') {
      // Find workflow in store or load from API
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow) {
        setCurrentWorkflow(workflow);
        setWorkflowName(workflow.name);
        
        // Load nodes and edges if they exist
        if (workflow.nodes && workflow.nodes.length > 0) {
          setNodes(workflow.nodes);
        }
        if (workflow.edges && workflow.edges.length > 0) {
          setEdges(workflow.edges);
        }
      }
    } else {
      // New workflow
      setCurrentWorkflow(null);
      setWorkflowName('Untitled Workflow');
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [workflowId, workflows, setCurrentWorkflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodeAdd = useCallback((nodeType: string) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        type: nodeType,
        config: {},
        description: `${nodeType} node`
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const onNodeUpdate = useCallback((nodeId: string, updates: Partial<Node['data']>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
      )
    );
  }, [setNodes]);

  const onNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  const handleExecute = async () => {
    if (nodes.length === 0) {
      toast.error('Please add some nodes to your workflow');
      return;
    }

    setIsExecuting(true);
    try {
      // Save workflow before executing
      await handleSave();
      
      // Execute workflow
      const workflowIdToExecute = currentWorkflow?.id || 'current';
      await executeWorkflow(workflowIdToExecute);
      toast.success('Workflow executed successfully!');
      
      // Show chatbot if there's a chatbot node
      const hasChatbotNode = nodes.some(node => node.data.type === 'chatbot');
      if (hasChatbotNode) {
        setShowChatBot(true);
      }
    } catch (error) {
      toast.error('Failed to execute workflow');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async () => {
    try {
      const workflowData = {
        name: workflowName,
        description: `Workflow with ${nodes.length} nodes`,
        nodes,
        edges,
        status: 'draft',
        isPublic: false
      };

      if (currentWorkflow) {
        // Update existing workflow
        await updateWorkflow(currentWorkflow.id, workflowData);
        toast.success('Workflow updated successfully!');
      } else {
        // Create new workflow
        const newWorkflow = await createWorkflow(workflowData);
        setCurrentWorkflow(newWorkflow);
        // Update URL without navigation
        window.history.replaceState(null, '', `/workflows/${newWorkflow.id}`);
        toast.success('Workflow saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/workflows">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workflows
              </Button>
            </Link>
            <div className="border-l border-gray-300 pl-4">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                placeholder="Workflow name..."
              />
              <p className="text-sm text-gray-500">
                {currentWorkflow ? 'Last saved: ' + new Date(currentWorkflow.updatedAt).toLocaleString() : 'Not saved yet'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleExecute}
              isLoading={isExecuting}
              className="bg-accent-600 hover:bg-accent-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
            <Button onClick={handleSave} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            {executionResult?.data?.chatbotEnabled && (
              <Button
                onClick={() => setShowChatBot(true)}
                variant="outline"
                className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Test Chat
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Node Panel */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <NodePanel onNodeAdd={onNodeAdd} />
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Node Configuration Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-80 bg-white border-l border-gray-200 overflow-y-auto"
            >
              <Card className="m-4 border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Node Configuration</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedNode(null)}
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Node Type
                      </label>
                      <input
                        type="text"
                        value={selectedNode.data.type}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={selectedNode.data.label}
                        onChange={(e) =>
                          onNodeUpdate(selectedNode.id, { label: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={selectedNode.data.description || ''}
                        onChange={(e) =>
                          onNodeUpdate(selectedNode.id, { description: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={3}
                      />
                    </div>
                    {selectedNode.data.type === 'chatbot' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            OpenAI API Key
                          </label>
                          <input
                            type="password"
                            placeholder="Enter your OpenAI API key"
                            value={selectedNode.data.config?.openai_api_key || ''}
                            onChange={(e) =>
                              onNodeUpdate(selectedNode.id, { 
                                config: { 
                                  ...selectedNode.data.config, 
                                  openai_api_key: e.target.value 
                                } 
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model
                          </label>
                          <select
                            value={selectedNode.data.config?.model || 'gpt-3.5-turbo'}
                            onChange={(e) =>
                              onNodeUpdate(selectedNode.id, { 
                                config: { 
                                  ...selectedNode.data.config, 
                                  model: e.target.value 
                                } 
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-4">GPT-4</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            System Prompt
                          </label>
                          <textarea
                            value={selectedNode.data.config?.system_prompt || ''}
                            onChange={(e) =>
                              onNodeUpdate(selectedNode.id, { 
                                config: { 
                                  ...selectedNode.data.config, 
                                  system_prompt: e.target.value 
                                } 
                              })
                            }
                            placeholder="You are a helpful assistant..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={4}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          toast.success('Node configuration updated');
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNodeDelete(selectedNode.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ChatBot Modal */}
      <AnimatePresence>
        {showChatBot && (
          <ChatBot onClose={() => setShowChatBot(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};