import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Edit, 
  Trash2, 
  Copy, 
  Share2, 
  Calendar, 
  Clock,
  Activity,
  MoreVertical,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useWorkflowStore } from '../store/workflowStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface WorkflowFilters {
  status: 'all' | 'draft' | 'published' | 'archived';
  sortBy: 'updated' | 'created' | 'name';
  sortOrder: 'asc' | 'desc';
}

export const WorkflowsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [filters, setFilters] = useState<WorkflowFilters>({
    status: 'all',
    sortBy: 'updated',
    sortOrder: 'desc'
  });

  const { workflows, loadWorkflows, deleteWorkflow, isLoading } = useWorkflowStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // Mock workflows for demonstration
  const mockWorkflows = [
    {
      id: '1',
      name: 'Customer Support Automation',
      description: 'Automated customer support workflow with AI chatbot and ticket routing',
      status: 'published',
      isPublic: false,
      nodes: 8,
      lastRun: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      executions: 156,
      successRate: 94.2
    },
    {
      id: '2',
      name: 'Lead Generation Pipeline',
      description: 'Capture and qualify leads from multiple sources automatically',
      status: 'draft',
      isPublic: false,
      nodes: 12,
      lastRun: null,
      createdAt: '2024-01-12T14:20:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      executions: 0,
      successRate: 0
    },
    {
      id: '3',
      name: 'Social Media Scheduler',
      description: 'Schedule and publish content across multiple social platforms',
      status: 'published',
      isPublic: true,
      nodes: 6,
      lastRun: '2024-01-16T08:00:00Z',
      createdAt: '2024-01-08T11:15:00Z',
      updatedAt: '2024-01-16T08:00:00Z',
      executions: 89,
      successRate: 98.9
    },
    {
      id: '4',
      name: 'Invoice Processing System',
      description: 'Extract data from invoices and update accounting systems',
      status: 'published',
      isPublic: false,
      nodes: 10,
      lastRun: '2024-01-16T12:15:00Z',
      createdAt: '2024-01-05T13:30:00Z',
      updatedAt: '2024-01-16T12:15:00Z',
      executions: 234,
      successRate: 91.7
    }
  ];

  const allWorkflows = [...workflows, ...mockWorkflows];

  const filteredWorkflows = allWorkflows
    .filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status === 'all' || workflow.status === filters.status;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[filters.sortBy === 'updated' ? 'updatedAt' : filters.sortBy === 'created' ? 'createdAt' : 'name'];
      const bValue = b[filters.sortBy === 'updated' ? 'updatedAt' : filters.sortBy === 'created' ? 'createdAt' : 'name'];
      
      if (filters.sortBy === 'name') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      const aDate = new Date(aValue).getTime();
      const bDate = new Date(bValue).getTime();
      return filters.sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    });

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await deleteWorkflow(workflowId);
        toast.success('Workflow deleted successfully');
      } catch (error) {
        toast.error('Failed to delete workflow');
      }
    }
  };

  const handleDuplicateWorkflow = (workflowId: string) => {
    // Implement duplication logic
    toast.success('Workflow duplicated successfully');
  };

  const handleShareWorkflow = (workflowId: string) => {
    // Implement sharing logic
    navigator.clipboard.writeText(`${window.location.origin}/workflows/${workflowId}`);
    toast.success('Workflow link copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatLastRun = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Workflows</h1>
              <p className="text-gray-600">
                Manage and monitor your automation workflows
              </p>
            </div>
            <Link to="/workflows/new">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                New Workflow
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                    <p className="text-3xl font-bold text-gray-900">{allWorkflows.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-primary-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {allWorkflows.filter(w => w.status === 'published').length}
                    </p>
                  </div>
                  <Play className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Executions</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {allWorkflows.reduce((sum, w) => sum + (w.executions || 0), 0)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round(allWorkflows.reduce((sum, w) => sum + (w.successRate || 0), 0) / allWorkflows.length)}%
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-accent-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="updated-desc">Recently Updated</option>
                <option value="created-desc">Recently Created</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>

          {/* Workflows Grid */}
          {filteredWorkflows.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredWorkflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{workflow.name}</h3>
                            {workflow.isPublic && (
                              <Share2 className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(workflow.status)}`}>
                            {workflow.status}
                          </span>
                          <div className="relative">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Nodes:</span>
                            <span className="ml-2 font-medium">{workflow.nodes}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Executions:</span>
                            <span className="ml-2 font-medium">{workflow.executions || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Success Rate:</span>
                            <span className="ml-2 font-medium">{workflow.successRate || 0}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Last Run:</span>
                            <span className="ml-2 font-medium">{formatLastRun(workflow.lastRun)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Updated {formatDate(workflow.updatedAt)}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link to={`/workflows/${workflow.id}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateWorkflow(workflow.id)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareWorkflow(workflow.id)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No workflows found' : 'No workflows yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search criteria or create a new workflow.'
                    : 'Get started by creating your first workflow automation.'
                  }
                </p>
                <Link to="/workflows/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Workflow
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};