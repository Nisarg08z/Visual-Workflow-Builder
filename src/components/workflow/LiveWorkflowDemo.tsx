import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Play, Zap, MessageCircle, Database, Mail } from 'lucide-react';
import { Button } from '../ui/Button';

// Custom node component for the demo
const DemoNode: React.FC<any> = ({ data, selected }) => {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'trigger':
        return <Play className="w-4 h-4" />;
      case 'chatbot':
        return <MessageCircle className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'trigger':
        return 'bg-accent-500';
      case 'chatbot':
        return 'bg-secondary-500';
      case 'database':
        return 'bg-blue-500';
      case 'email':
        return 'bg-red-500';
      default:
        return 'bg-primary-500';
    }
  };

  const iconColor = getNodeColor(data.type);
  
  return (
    <div className={`
      px-3 py-2 shadow-lg rounded-lg bg-white border-2 min-w-[120px]
      ${selected ? 'border-primary-500' : 'border-gray-200'}
      hover:shadow-xl transition-all duration-200
    `}>
      <div className="flex items-center space-x-2">
        <div className={`p-1.5 rounded-md ${iconColor} text-white`}>
          {getNodeIcon(data.type)}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 text-sm">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-500 mt-0.5">{data.description}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  demo: DemoNode,
};

// Default workflow nodes for the demo
const defaultNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'demo',
    position: { x: 50, y: 100 },
    data: { 
      label: 'Customer Query', 
      type: 'trigger',
      description: 'Webhook trigger'
    },
  },
  {
    id: 'chatbot-1',
    type: 'demo',
    position: { x: 250, y: 100 },
    data: { 
      label: 'AI Assistant', 
      type: 'chatbot',
      description: 'GPT-powered bot'
    },
  },
  {
    id: 'database-1',
    type: 'demo',
    position: { x: 450, y: 50 },
    data: { 
      label: 'Log Conversation', 
      type: 'database',
      description: 'Store chat history'
    },
  },
  {
    id: 'email-1',
    type: 'demo',
    position: { x: 450, y: 150 },
    data: { 
      label: 'Escalate to Human', 
      type: 'email',
      description: 'Complex issues'
    },
  },
];

const defaultEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'trigger-1',
    target: 'chatbot-1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#0ea5e9', strokeWidth: 2 }
  },
  {
    id: 'e2-3',
    source: 'chatbot-1',
    target: 'database-1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#0ea5e9', strokeWidth: 2 }
  },
  {
    id: 'e2-4',
    source: 'chatbot-1',
    target: 'email-1',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#0ea5e9', strokeWidth: 2 }
  },
];

export const LiveWorkflowDemo: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);

  const handleExecuteDemo = useCallback(() => {
    setIsExecuting(true);
    setExecutionStep(0);

    // Simulate workflow execution with step-by-step animation
    const steps = [
      { nodeId: 'trigger-1', delay: 500 },
      { nodeId: 'chatbot-1', delay: 1500 },
      { nodeId: 'database-1', delay: 2500 },
      { nodeId: 'email-1', delay: 3000 },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setExecutionStep(index + 1);
        
        // Highlight the executing node
        setNodes(prevNodes => 
          prevNodes.map(node => ({
            ...node,
            style: node.id === step.nodeId 
              ? { 
                  ...node.style, 
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
                  transform: 'scale(1.05)'
                }
              : { ...node.style, boxShadow: 'none', transform: 'scale(1)' }
          }))
        );

        // Reset execution state after the last step
        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsExecuting(false);
            setExecutionStep(0);
            setNodes(prevNodes => 
              prevNodes.map(node => ({
                ...node,
                style: { ...node.style, boxShadow: 'none', transform: 'scale(1)' }
              }))
            );
          }, 1000);
        }
      }, step.delay);
    });
  }, [setNodes]);

  const getExecutionMessage = () => {
    switch (executionStep) {
      case 1: return 'Customer query received...';
      case 2: return 'AI processing the request...';
      case 3: return 'Logging conversation to database...';
      case 4: return 'Escalating complex issue to human agent...';
      default: return 'Ready to execute workflow';
    }
  };

  return (
    <div className="relative w-full h-96 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Demo Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Customer Support Automation</h3>
          <p className="text-xs text-gray-600">Live Demo Workflow</p>
        </div>
        <Button
          size="sm"
          onClick={handleExecuteDemo}
          disabled={isExecuting}
          className="bg-accent-600 hover:bg-accent-700"
        >
          {isExecuting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Demo
            </>
          )}
        </Button>
      </div>

      {/* Execution Status */}
      {isExecuting && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-4 right-4 z-10"
        >
          <div className="bg-accent-100 border border-accent-200 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-accent-800">
                {getExecutionMessage()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnDrag={false}
        className="bg-gradient-to-br from-gray-50 to-blue-50"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="#e5e7eb"
        />
        <Controls 
          showZoom={false}
          showFitView={false}
          showInteractive={false}
        />
        <MiniMap 
          nodeColor="#e5e7eb"
          maskColor="rgba(255, 255, 255, 0.8)"
          style={{
            height: 60,
            width: 80,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        />
      </ReactFlow>

      {/* Demo Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Interactive Workflow Demo
              </p>
              <p className="text-xs text-gray-600">
                Click "Run Demo" to see the workflow in action
              </p>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span>4 Nodes</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>3 Connections</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};