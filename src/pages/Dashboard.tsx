import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Play, Edit, Trash2, Calendar, Users, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useWorkflowStore } from '../store/workflowStore';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { workflows } = useWorkflowStore();

  const stats = [
    {
      label: 'Total Workflows',
      value: workflows.length,
      icon: <Activity className="w-6 h-6 text-primary-500" />,
      color: 'bg-primary-50'
    },
    {
      label: 'Active Workflows',
      value: workflows.filter(w => w.status === 'published').length,
      icon: <Play className="w-6 h-6 text-accent-500" />,
      color: 'bg-accent-50'
    },
    {
      label: 'Draft Workflows',
      value: workflows.filter(w => w.status === 'draft').length,
      icon: <Edit className="w-6 h-6 text-secondary-500" />,
      color: 'bg-secondary-50'
    },
    {
      label: 'Shared Workflows',
      value: workflows.filter(w => w.isPublic).length,
      icon: <Users className="w-6 h-6 text-primary-500" />,
      color: 'bg-primary-50'
    }
  ];

  const recentWorkflows = workflows.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Manage your workflows and track your automation progress.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/workflows/new">
                <Button size="lg" className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New Workflow</span>
                </Button>
              </Link>
              <Link to="/templates">
                <Button variant="outline" size="lg">
                  Browse Templates
                </Button>
              </Link>
              <Link to="/integrations">
                <Button variant="outline" size="lg">
                  View Integrations
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Workflows */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Workflows</h2>
              <Link to="/workflows">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            {recentWorkflows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentWorkflows.map((workflow, index) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              workflow.status === 'published' 
                                ? 'bg-accent-100 text-accent-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {workflow.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">
                          {workflow.description || 'No description provided'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link to={`/workflows/${workflow.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
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
                    No workflows yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by creating your first workflow automation.
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};