import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  MessageCircle, 
  Database, 
  Mail, 
  Globe, 
  Zap, 
  Code, 
  Settings,
  Play
} from 'lucide-react';

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'trigger':
      return <Play className="w-5 h-5" />;
    case 'chatbot':
      return <MessageCircle className="w-5 h-5" />;
    case 'database':
      return <Database className="w-5 h-5" />;
    case 'email':
      return <Mail className="w-5 h-5" />;
    case 'webhook':
      return <Globe className="w-5 h-5" />;
    case 'ai':
      return <Zap className="w-5 h-5" />;
    case 'code':
      return <Code className="w-5 h-5" />;
    default:
      return <Settings className="w-5 h-5" />;
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
    case 'webhook':
      return 'bg-purple-500';
    case 'ai':
      return 'bg-yellow-500';
    case 'code':
      return 'bg-gray-500';
    default:
      return 'bg-primary-500';
  }
};

export const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const iconColor = getNodeColor(data.type);
  
  return (
    <div className={`
      px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[150px]
      ${selected ? 'border-primary-500' : 'border-gray-200'}
      hover:shadow-xl transition-shadow duration-200
    `}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${iconColor} text-white`}>
          {getNodeIcon(data.type)}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-500 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      
      {data.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
};