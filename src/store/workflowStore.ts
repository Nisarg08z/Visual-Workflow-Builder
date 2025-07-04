import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { workflowsAPI, executionAPI, Workflow, Execution } from '../lib/api';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  isExecuting: boolean;
  executionResult: any;
  isLoading: boolean;
  
  // Actions
  loadWorkflows: () => Promise<void>;
  createWorkflow: (workflowData: Partial<Workflow>) => Promise<Workflow>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  executeWorkflow: (workflowId: string, inputData?: any) => Promise<void>;
  setExecutionResult: (result: any) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  isExecuting: false,
  executionResult: null,
  isLoading: false,

  loadWorkflows: async () => {
    set({ isLoading: true });
    try {
      // For now, we'll use mock data since the backend might not be running
      // const workflows = await workflowsAPI.getAll();
      const workflows: Workflow[] = []; // Mock empty array
      set({ workflows, isLoading: false });
    } catch (error) {
      console.error('Failed to load workflows:', error);
      set({ workflows: [], isLoading: false });
    }
  },

  createWorkflow: async (workflowData: Partial<Workflow>) => {
    try {
      // For now, create a mock workflow since backend might not be running
      const newWorkflow: Workflow = {
        id: `workflow-${Date.now()}`,
        name: workflowData.name || 'Untitled Workflow',
        description: workflowData.description || '',
        nodes: workflowData.nodes || [],
        edges: workflowData.edges || [],
        is_public: workflowData.isPublic || false,
        status: workflowData.status || 'draft',
        user_id: 'current-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      set((state) => ({
        workflows: [...state.workflows, newWorkflow],
        currentWorkflow: newWorkflow
      }));
      
      return newWorkflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  },

  updateWorkflow: async (id: string, updates: Partial<Workflow>) => {
    try {
      const updatedWorkflow = {
        ...get().currentWorkflow,
        ...updates,
        id,
        updated_at: new Date().toISOString()
      } as Workflow;

      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id ? updatedWorkflow : w
        ),
        currentWorkflow: updatedWorkflow
      }));
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  },

  deleteWorkflow: async (id: string) => {
    try {
      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
        currentWorkflow:
          state.currentWorkflow?.id === id ? null : state.currentWorkflow,
      }));
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  },

  setCurrentWorkflow: (workflow) => {
    set({ currentWorkflow: workflow });
  },

  executeWorkflow: async (workflowId: string, inputData = {}) => {
    set({ isExecuting: true });
    try {
      // Mock execution result
      const result = {
        success: true,
        data: {
          chatbotEnabled: true,
          message: 'Workflow executed successfully'
        }
      };
      
      set({ 
        isExecuting: false, 
        executionResult: result
      });
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      set({ 
        isExecuting: false, 
        executionResult: { 
          success: false, 
          error: error.message 
        }
      });
      throw error;
    }
  },

  setExecutionResult: (result) => {
    set({ executionResult: result });
  },
}));