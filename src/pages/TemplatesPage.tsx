import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  MessageCircle, 
  Database, 
  Mail, 
  Globe, 
  Zap, 
  Code,
  Play,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useWorkflowStore } from '../store/workflowStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  nodes: number;
  downloads: number;
  rating: number;
  author: string;
  tags: string[];
  preview: string;
  estimatedTime: string;
  workflowData: {
    nodes: any[];
    edges: any[];
  };
}

export const TemplatesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { createWorkflow } = useWorkflowStore();
  const { isAuthenticated } = useAuthStore();

  const templates: Template[] = [
    {
      id: '1',
      name: 'Customer Support Chatbot',
      description: 'Automated customer support workflow with AI-powered responses and ticket creation',
      category: 'Customer Service',
      difficulty: 'Beginner',
      nodes: 5,
      downloads: 1250,
      rating: 4.8,
      author: 'WorkflowAI Team',
      tags: ['chatbot', 'customer-service', 'ai', 'automation'],
      preview: 'A complete customer support automation that handles common queries and escalates complex issues',
      estimatedTime: '15 min',
      workflowData: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { 
              label: 'Webhook Trigger', 
              type: 'trigger',
              description: 'Receives customer messages'
            }
          },
          {
            id: 'chatbot-1',
            type: 'custom',
            position: { x: 300, y: 100 },
            data: { 
              label: 'AI Chatbot', 
              type: 'chatbot',
              description: 'AI-powered customer support bot',
              config: {
                model: 'gpt-3.5-turbo',
                system_prompt: 'You are a helpful customer support assistant. Provide clear and concise answers to customer queries.',
                temperature: 0.7
              }
            }
          },
          {
            id: 'database-1',
            type: 'custom',
            position: { x: 500, y: 100 },
            data: { 
              label: 'Log Conversation', 
              type: 'database',
              description: 'Store conversation history'
            }
          },
          {
            id: 'email-1',
            type: 'custom',
            position: { x: 300, y: 250 },
            data: { 
              label: 'Escalation Email', 
              type: 'email',
              description: 'Send complex issues to human agents'
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-1', target: 'chatbot-1' },
          { id: 'e2-3', source: 'chatbot-1', target: 'database-1' },
          { id: 'e2-4', source: 'chatbot-1', target: 'email-1' }
        ]
      }
    },
    {
      id: '2',
      name: 'Lead Generation Pipeline',
      description: 'Capture leads from multiple sources, qualify them, and send to CRM automatically',
      category: 'Sales & Marketing',
      difficulty: 'Intermediate',
      nodes: 8,
      downloads: 890,
      rating: 4.6,
      author: 'Sales Pro',
      tags: ['lead-generation', 'crm', 'email', 'automation'],
      preview: 'Multi-channel lead capture with automatic qualification and CRM integration',
      estimatedTime: '25 min',
      workflowData: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { 
              label: 'Form Submission', 
              type: 'trigger',
              description: 'Captures lead form submissions'
            }
          },
          {
            id: 'ai-1',
            type: 'custom',
            position: { x: 300, y: 100 },
            data: { 
              label: 'Lead Qualification', 
              type: 'ai',
              description: 'AI-powered lead scoring and qualification'
            }
          },
          {
            id: 'database-1',
            type: 'custom',
            position: { x: 500, y: 50 },
            data: { 
              label: 'CRM Integration', 
              type: 'database',
              description: 'Add qualified leads to CRM'
            }
          },
          {
            id: 'email-1',
            type: 'custom',
            position: { x: 500, y: 150 },
            data: { 
              label: 'Welcome Email', 
              type: 'email',
              description: 'Send personalized welcome email'
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-1', target: 'ai-1' },
          { id: 'e2-3', source: 'ai-1', target: 'database-1' },
          { id: 'e2-4', source: 'ai-1', target: 'email-1' }
        ]
      }
    },
    {
      id: '3',
      name: 'Data Processing & Analysis',
      description: 'Process CSV files, analyze data with AI, and generate automated reports',
      category: 'Data & Analytics',
      difficulty: 'Advanced',
      nodes: 12,
      downloads: 567,
      rating: 4.9,
      author: 'Data Scientist',
      tags: ['data-processing', 'ai-analysis', 'reports', 'csv'],
      preview: 'Advanced data pipeline with AI-powered insights and automated reporting',
      estimatedTime: '45 min',
      workflowData: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { 
              label: 'File Upload', 
              type: 'trigger',
              description: 'Triggers on CSV file upload'
            }
          },
          {
            id: 'transform-1',
            type: 'custom',
            position: { x: 300, y: 100 },
            data: { 
              label: 'Data Cleaning', 
              type: 'transform',
              description: 'Clean and validate data'
            }
          },
          {
            id: 'ai-1',
            type: 'custom',
            position: { x: 500, y: 100 },
            data: { 
              label: 'AI Analysis', 
              type: 'ai',
              description: 'Generate insights with AI'
            }
          },
          {
            id: 'email-1',
            type: 'custom',
            position: { x: 700, y: 100 },
            data: { 
              label: 'Report Email', 
              type: 'email',
              description: 'Send analysis report'
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-1', target: 'transform-1' },
          { id: 'e2-3', source: 'transform-1', target: 'ai-1' },
          { id: 'e3-4', source: 'ai-1', target: 'email-1' }
        ]
      }
    },
    {
      id: '4',
      name: 'Social Media Scheduler',
      description: 'Schedule and publish content across multiple social media platforms',
      category: 'Social Media',
      difficulty: 'Beginner',
      nodes: 6,
      downloads: 1100,
      rating: 4.5,
      author: 'Social Media Expert',
      tags: ['social-media', 'scheduling', 'content', 'automation'],
      preview: 'Multi-platform social media posting with optimal timing and engagement tracking',
      estimatedTime: '20 min',
      workflowData: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { 
              label: 'Schedule Trigger', 
              type: 'trigger',
              description: 'Scheduled content posting'
            }
          },
          {
            id: 'webhook-1',
            type: 'custom',
            position: { x: 300, y: 50 },
            data: { 
              label: 'Twitter API', 
              type: 'webhook',
              description: 'Post to Twitter'
            }
          },
          {
            id: 'webhook-2',
            type: 'custom',
            position: { x: 300, y: 150 },
            data: { 
              label: 'LinkedIn API', 
              type: 'webhook',
              description: 'Post to LinkedIn'
            }
          },
          {
            id: 'database-1',
            type: 'custom',
            position: { x: 500, y: 100 },
            data: { 
              label: 'Analytics', 
              type: 'database',
              description: 'Track engagement metrics'
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-1', target: 'webhook-1' },
          { id: 'e1-3', source: 'trigger-1', target: 'webhook-2' },
          { id: 'e2-4', source: 'webhook-1', target: 'database-1' },
          { id: 'e3-4', source: 'webhook-2', target: 'database-1' }
        ]
      }
    },
    {
      id: '5',
      name: 'Invoice Processing System',
      description: 'Extract data from invoices, validate information, and update accounting systems',
      category: 'Finance & Accounting',
      difficulty: 'Intermediate',
      nodes: 10,
      downloads: 723,
      rating: 4.7,
      author: 'Finance Automation',
      tags: ['invoice', 'ocr', 'accounting', 'validation'],
      preview: 'Automated invoice processing with OCR and accounting system integration',
      estimatedTime: '30 min',
      workflowData: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { 
              label: 'Email Trigger', 
              type: 'trigger',
              description: 'Receives invoice emails'
            }
          },
          {
            id: 'ai-1',
            type: 'custom',
            position: { x: 300, y: 100 },
            data: { 
              label: 'OCR Processing', 
              type: 'ai',
              description: 'Extract data from invoice'
            }
          },
          {
            id: 'transform-1',
            type: 'custom',
            position: { x: 500, y: 100 },
            data: { 
              label: 'Data Validation', 
              type: 'transform',
              description: 'Validate extracted data'
            }
          },
          {
            id: 'database-1',
            type: 'custom',
            position: { x: 700, y: 100 },
            data: { 
              label: 'Accounting System', 
              type: 'database',
              description: 'Update accounting records'
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-1', target: 'ai-1' },
          { id: 'e2-3', source: 'ai-1', target: 'transform-1' },
          { id: 'e3-4', source: 'transform-1', target: 'database-1' }
        ]
      }
    },
    {
      id: '6',
      name: 'E-commerce Order Fulfillment',
      description: 'Complete order processing from payment to shipping notification',
      category: 'E-commerce',
      difficulty: 'Advanced',
      nodes: 15,
      downloads: 445,
      rating: 4.8,
      author: 'E-commerce Pro',
      tags: ['e-commerce', 'orders', 'shipping', 'payments'],
      preview: 'End-to-end order fulfillment with inventory management and customer notifications',
      estimatedTime: '50 min',
      workflowData: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { 
              label: 'Order Received', 
              type: 'trigger',
              description: 'New order webhook'
            }
          },
          {
            id: 'database-1',
            type: 'custom',
            position: { x: 300, y: 100 },
            data: { 
              label: 'Inventory Check', 
              type: 'database',
              description: 'Check product availability'
            }
          },
          {
            id: 'webhook-1',
            type: 'custom',
            position: { x: 500, y: 100 },
            data: { 
              label: 'Payment Processing', 
              type: 'webhook',
              description: 'Process payment'
            }
          },
          {
            id: 'email-1',
            type: 'custom',
            position: { x: 700, y: 100 },
            data: { 
              label: 'Order Confirmation', 
              type: 'email',
              description: 'Send confirmation email'
            }
          },
          {
            id: 'webhook-2',
            type: 'custom',
            position: { x: 500, y: 200 },
            data: { 
              label: 'Shipping Label', 
              type: 'webhook',
              description: 'Generate shipping label'
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-1', target: 'database-1' },
          { id: 'e2-3', source: 'database-1', target: 'webhook-1' },
          { id: 'e3-4', source: 'webhook-1', target: 'email-1' },
          { id: 'e3-5', source: 'webhook-1', target: 'webhook-2' }
        ]
      }
    }
  ];

  const categories = [
    'all',
    'Customer Service',
    'Sales & Marketing',
    'Data & Analytics',
    'Social Media',
    'Finance & Accounting',
    'E-commerce'
  ];

  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleUseTemplate = async (template: Template) => {
    if (!isAuthenticated) {
      toast.error('Please login to use templates');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      // Create a new workflow from the template
      const workflowData = {
        name: `${template.name} (from template)`,
        description: template.description,
        nodes: template.workflowData.nodes,
        edges: template.workflowData.edges,
        status: 'draft',
        isPublic: false
      };

      const newWorkflow = await createWorkflow(workflowData);
      
      // Increment download count (in a real app, this would be done on the backend)
      toast.success('Template loaded successfully!');
      
      // Navigate to the workflow builder with the new workflow
      navigate(`/workflows/${newWorkflow.id}`);
    } catch (error) {
      console.error('Failed to create workflow from template:', error);
      toast.error('Failed to load template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Customer Service': return <MessageCircle className="w-5 h-5" />;
      case 'Sales & Marketing': return <Users className="w-5 h-5" />;
      case 'Data & Analytics': return <Database className="w-5 h-5" />;
      case 'Social Media': return <Globe className="w-5 h-5" />;
      case 'Finance & Accounting': return <Mail className="w-5 h-5" />;
      case 'E-commerce': return <Zap className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Workflow Templates</h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Get started quickly with pre-built workflow templates. Choose from our collection 
              of proven automation patterns and customize them for your needs.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty === 'all' ? 'All Levels' : difficulty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          {getCategoryIcon(template.category)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600">{template.category}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Code className="w-4 h-4" />
                          <span>{template.nodes} nodes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{template.estimatedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{template.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span className="text-sm">{template.downloads}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">by {template.author}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleUseTemplate(template)}
                        isLoading={isLoading}
                        disabled={isLoading}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all templates.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};