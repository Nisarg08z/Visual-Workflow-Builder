import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Zap, Shield, Cpu, Users, Star, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { LiveWorkflowDemo } from '../components/workflow/LiveWorkflowDemo';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary-500" />,
      title: "Lightning Fast",
      description: "Execute workflows in milliseconds with our optimized engine"
    },
    {
      icon: <Shield className="w-8 h-8 text-accent-500" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    },
    {
      icon: <Cpu className="w-8 h-8 text-secondary-500" />,
      title: "AI-Powered",
      description: "Leverage AI and machine learning for intelligent automation"
    },
    {
      icon: <Users className="w-8 h-8 text-primary-500" />,
      title: "Team Collaboration",
      description: "Share workflows and collaborate with your team seamlessly"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO, TechCorp",
      content: "WorkflowAI has transformed how we handle automation. The intuitive interface and powerful AI capabilities are game-changing.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Product Manager, StartupXYZ",
      content: "The drag-and-drop workflow builder is incredibly intuitive. We've reduced our automation setup time by 80%.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist, DataFlow",
      content: "The custom node creation feature allows us to integrate our proprietary algorithms seamlessly.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Build Powerful
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  {" "}AI Workflows
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Create, automate, and scale your business processes with our intuitive 
                drag-and-drop workflow builder powered by cutting-edge AI technology.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link to="/register">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Start Building <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/templates">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  View Templates
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Live Workflow Builder Demo
                  </h3>
                  <p className="text-gray-600">
                    See how easy it is to build powerful automations with our visual editor
                  </p>
                </div>
                <LiveWorkflowDemo />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Automate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make workflow automation simple, 
              secure, and scalable for teams of all sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Builder Preview */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Visual Workflow Builder
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Design complex workflows with our intuitive drag-and-drop interface. 
                No coding required - just connect the nodes and watch your automation come to life.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-500" />
                  <span className="text-gray-700">Drag & drop node editor</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-500" />
                  <span className="text-gray-700">Real-time workflow testing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-500" />
                  <span className="text-gray-700">Custom node creation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent-500" />
                  <span className="text-gray-700">AI-powered suggestions</span>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/workflows/new">
                  <Button size="lg">
                    Try the Builder <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Customer Support Workflow
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Automated customer support with AI chatbot
                  </p>
                </div>
                <div className="h-64">
                  <LiveWorkflowDemo />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of teams who trust WorkflowAI to power their automation needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Workflows?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of teams who have already revolutionized their automation 
              with WorkflowAI. Start building today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/templates">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg">
                  Browse Templates
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};