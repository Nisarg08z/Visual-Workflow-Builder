import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Database, 
  Mail, 
  Globe, 
  Zap, 
  Code, 
  Settings,
  Play,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface NodePanelProps {
  onNodeAdd: (nodeType: string) => void;
}

export const NodePanel: React.FC<NodePanelProps> = ({ onNodeAdd }) => {
  const nodeTypes = [
    {
      type: 'trigger',
      label: 'Trigger',
      icon: <Play className="w-5 h-5" />,
      description: 'Start workflow execution',
      color: 'bg-accent-500'
    },
    {
      type: 'chatbot',
      label: 'ChatBot',
      icon: <MessageCircle className="w-5 h-5" />,
      description: 'AI-powered conversation',
      color: 'bg-secondary-500'
    },
    {
      type: 'database',
      label: 'Database',
      icon: <Database className="w-5 h-5" />,
      description: 'Store and retrieve data',
      color: 'bg-blue-500'
    },
    {
      type: 'email',
      label: 'Email',
      icon: <Mail className="w-5 h-5" />,
      description: 'Send email notifications',
      color: 'bg-red-500'
    },
    {
      type: 'webhook',
      label: 'Webhook',
      icon: <Globe className="w-5 h-5" />,
      description: 'HTTP requests and APIs',
      color: 'bg-purple-500'
    },
    {
      type: 'ai',
      label: 'AI Processing',
      icon: <Zap className="w-5 h-5" />,
      description: 'AI and ML operations',
      color: 'bg-yellow-500'
    },
    {
      type: 'code',
      label: 'Code',
      icon: <Code className="w-5 h-5" />,
      description: 'Custom Python code',
      color: 'bg-gray-500'
    },
    {
      type: 'transform',
      label: 'Transform',
      icon: <Settings className="w-5 h-5" />,
      description: 'Data transformation',
      color: 'bg-primary-500'
    }
  ];

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Workflow Nodes</h2>
        <p className="text-sm text-gray-600">
          Drag and drop nodes to build your workflow
        </p>
      </div>

      <div className="space-y-3">
        {nodeTypes.map((node, index) => (
          <motion.div
            key={node.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-primary-200"
              onClick={() => onNodeAdd(node.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${node.color} text-white`}>
                    {node.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{node.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {node.description}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Custom Nodes</h3>
        <p className="text-sm text-gray-600 mb-3">
          Create your own custom nodes with Python code
        </p>
        <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors">
          <Plus className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">Add Custom Node</span>
        </button>
      </div>
    </div>
  );
};