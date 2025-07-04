import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Book, 
  Code, 
  Zap, 
  Settings, 
  Users, 
  Shield, 
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  description: string;
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const DocsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const docSections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Learn the basics of WorkflowAI and create your first automation',
      icon: <Book className="w-6 h-6" />,
      articles: [
        {
          id: 'quick-start',
          title: 'Quick Start Guide',
          description: 'Get up and running with WorkflowAI in 5 minutes',
          readTime: '5 min',
          difficulty: 'Beginner'
        },
        {
          id: 'first-workflow',
          title: 'Creating Your First Workflow',
          description: 'Step-by-step guide to building your first automation',
          readTime: '10 min',
          difficulty: 'Beginner'
        },
        {
          id: 'understanding-nodes',
          title: 'Understanding Nodes',
          description: 'Learn about different node types and their capabilities',
          readTime: '8 min',
          difficulty: 'Beginner'
        }
      ]
    },
    {
      id: 'workflow-builder',
      title: 'Workflow Builder',
      description: 'Master the visual workflow editor and its features',
      icon: <Code className="w-6 h-6" />,
      articles: [
        {
          id: 'drag-drop-interface',
          title: 'Drag & Drop Interface',
          description: 'Learn how to use the visual workflow builder',
          readTime: '12 min',
          difficulty: 'Beginner'
        },
        {
          id: 'connecting-nodes',
          title: 'Connecting Nodes',
          description: 'Understanding data flow and node connections',
          readTime: '15 min',
          difficulty: 'Intermediate'
        },
        {
          id: 'conditional-logic',
          title: 'Conditional Logic',
          description: 'Implement branching and decision-making in workflows',
          readTime: '20 min',
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      id: 'ai-integration',
      title: 'AI Integration',
      description: 'Leverage AI and machine learning in your workflows',
      icon: <Zap className="w-6 h-6" />,
      articles: [
        {
          id: 'chatbot-setup',
          title: 'Setting Up Chatbots',
          description: 'Configure AI-powered chatbots with OpenAI integration',
          readTime: '18 min',
          difficulty: 'Intermediate'
        },
        {
          id: 'custom-ai-nodes',
          title: 'Custom AI Nodes',
          description: 'Create custom AI processing nodes with LangChain',
          readTime: '25 min',
          difficulty: 'Advanced'
        },
        {
          id: 'prompt-engineering',
          title: 'Prompt Engineering',
          description: 'Best practices for writing effective AI prompts',
          readTime: '15 min',
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      id: 'custom-nodes',
      title: 'Custom Nodes',
      description: 'Extend WorkflowAI with your own custom functionality',
      icon: <Settings className="w-6 h-6" />,
      articles: [
        {
          id: 'python-nodes',
          title: 'Creating Python Nodes',
          description: 'Build custom nodes with Python code',
          readTime: '30 min',
          difficulty: 'Advanced'
        },
        {
          id: 'node-configuration',
          title: 'Node Configuration',
          description: 'Define input/output schemas for custom nodes',
          readTime: '20 min',
          difficulty: 'Advanced'
        },
        {
          id: 'sharing-nodes',
          title: 'Sharing Custom Nodes',
          description: 'Share your custom nodes with the community',
          readTime: '10 min',
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Work together on workflows and share automations',
      icon: <Users className="w-6 h-6" />,
      articles: [
        {
          id: 'sharing-workflows',
          title: 'Sharing Workflows',
          description: 'Share workflows with team members and control access',
          readTime: '12 min',
          difficulty: 'Beginner'
        },
        {
          id: 'version-control',
          title: 'Version Control',
          description: 'Track changes and manage workflow versions',
          readTime: '15 min',
          difficulty: 'Intermediate'
        },
        {
          id: 'team-permissions',
          title: 'Team Permissions',
          description: 'Manage user roles and permissions',
          readTime: '10 min',
          difficulty: 'Intermediate'
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Keep your workflows and data secure',
      icon: <Shield className="w-6 h-6" />,
      articles: [
        {
          id: 'api-key-management',
          title: 'API Key Management',
          description: 'Securely store and manage API keys',
          readTime: '8 min',
          difficulty: 'Beginner'
        },
        {
          id: 'data-encryption',
          title: 'Data Encryption',
          description: 'Understanding how your data is protected',
          readTime: '12 min',
          difficulty: 'Intermediate'
        },
        {
          id: 'compliance',
          title: 'Compliance & Regulations',
          description: 'GDPR, SOC 2, and other compliance considerations',
          readTime: '15 min',
          difficulty: 'Intermediate'
        }
      ]
    }
  ];

  const codeExamples = {
    'python-node': `def execute(input_data):
    """
    Custom node execution function
    
    Args:
        input_data (dict): Input data from previous nodes
        
    Returns:
        dict: Output data for next nodes
    """
    # Your custom logic here
    result = process_data(input_data)
    
    return {
        "success": True,
        "output": result,
        "message": "Processing completed"
    }`,
    'api-integration': `import requests

def execute(input_data):
    api_key = input_data.get('api_key')
    endpoint = input_data.get('endpoint')
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(endpoint, 
                           json=input_data.get('payload'),
                           headers=headers)
    
    return {
        "status_code": response.status_code,
        "data": response.json()
    }`
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredSections = docSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.articles.length > 0 || searchTerm === '');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Everything you need to know about building powerful workflows with WorkflowAI. 
              From basic concepts to advanced integrations.
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h3>
                <nav className="space-y-2">
                  {filteredSections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSection === section.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {section.icon}
                        <span className="font-medium">{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {selectedSection ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {(() => {
                    const section = filteredSections.find(s => s.id === selectedSection);
                    if (!section) return null;

                    return (
                      <div>
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
                          <p className="text-gray-600">{section.description}</p>
                        </div>

                        <div className="space-y-4">
                          {section.articles.map(article => (
                            <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                      {article.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{article.description}</p>
                                    <div className="flex items-center space-x-4">
                                      <span className="text-sm text-gray-500">{article.readTime} read</span>
                                      <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(article.difficulty)}`}>
                                        {article.difficulty}
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Code Examples for specific sections */}
                        {selectedSection === 'custom-nodes' && (
                          <div className="mt-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Code Examples</h3>
                            <div className="space-y-6">
                              <Card>
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium">Basic Python Node</h4>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(codeExamples['python-node'], 'python-node')}
                                    >
                                      {copiedCode === 'python-node' ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{codeExamples['python-node']}</code>
                                  </pre>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium">API Integration Example</h4>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(codeExamples['api-integration'], 'api-integration')}
                                    >
                                      {copiedCode === 'api-integration' ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                    <code>{codeExamples['api-integration']}</code>
                                  </pre>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    >
                      <Card 
                        className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        onClick={() => setSelectedSection(section.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-primary-100 rounded-lg">
                              {section.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                          </div>
                          <p className="text-gray-600">{section.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {section.articles.slice(0, 3).map(article => (
                              <div key={article.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{article.title}</span>
                                <span className="text-gray-500">{article.readTime}</span>
                              </div>
                            ))}
                            {section.articles.length > 3 && (
                              <div className="text-sm text-primary-600 font-medium">
                                +{section.articles.length - 3} more articles
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-12 bg-white rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-5 h-5 text-primary-500" />
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  API Reference
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-5 h-5 text-primary-500" />
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Community Forum
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-5 h-5 text-primary-500" />
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};