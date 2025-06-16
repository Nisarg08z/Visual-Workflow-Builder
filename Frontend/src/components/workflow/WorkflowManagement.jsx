import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkflowsApi, deleteWorkflowApi, runWorkflowApi } from '../../utils/api';
import { UserContext } from '../../contexts/UserContext';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const WorkflowManagement = ({ onWorkflowRun }) => {
  const { isLogedin } = useContext(UserContext);
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorkflowsApi();
      if (data.success) {
        setWorkflows(data.data);
      } else {
        toast.error(data.message || 'Error fetching workflows.');
      }
    } catch (error) {
      toast.error(error.message || 'Network error fetching workflows.');
      console.error('Fetch Workflows Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLogedin) {
      fetchWorkflows();
    } else {
      setWorkflows([]);
    }
  }, [isLogedin, fetchWorkflows]);

  const handleDeleteWorkflow = async (id) => {
    if (window.confirm('Are you sure you want to delete this workflow? This will also delete its execution history!')) {
      setLoading(true);
      try {
        const data = await deleteWorkflowApi(id);
        if (data.success) {
          toast.success('Workflow deleted successfully!');
          fetchWorkflows();
        } else {
          toast.error(data.message || 'Error deleting workflow.');
        }
      } catch (error) {
        toast.error(error.message || 'Network error deleting workflow.');
        console.error('Delete Workflow Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRunWorkflow = async (workflowId) => {
    if (!isLogedin) {
      toast.error('You must be logged in to run a workflow.');
      navigate('/login');
      return;
    }
    setLoading(true);
    toast('Initiating workflow run...', { icon: '🚀' });
    try {
      const data = await runWorkflowApi(workflowId, { trigger: 'manual', timestamp: new Date().toISOString() });
      if (data.success) {
        toast.success(`Workflow run initiated! Execution ID: ${data.data.executionId}`);
        if (onWorkflowRun) {
          onWorkflowRun();
        }
      } else {
        toast.error(data.message || 'Error initiating workflow run.');
      }
    } catch (error) {
      toast.error(error.message || 'Network error initiating workflow run.');
      console.error('Run Workflow Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditWorkflow = (workflowId) => {
    navigate(`/new-project?id=${workflowId}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8 col-span-1">
      <h3 className="text-xl font-semibold mb-4 text-green-700">Manage Workflows</h3>

      {loading && <p className="text-center text-gray-600">Loading workflows...</p>}
      {!loading && workflows.length === 0 && isLogedin && (
        <p className="text-center text-gray-600">No workflows found. Create one in 'New Project'.</p>
      )}
      {!isLogedin && <p className="text-center text-red-500">Please log in to manage workflows.</p>}

      <ul className="space-y-4">
        {workflows.map((workflow) => (
          <li
            key={workflow._id}
            className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{workflow.workflowName}</p>
              <p className="text-sm text-gray-600">{workflow.description || 'No description'}</p>
              <p className="text-xs text-gray-500 truncate">ID: {workflow._id}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <Button
                onClick={() => handleEditWorkflow(workflow._id)}
                type="info"
                className="px-3 py-1 text-sm"
                disabled={loading}
              >
                Edit
              </Button>
              <Button
                onClick={() => handleRunWorkflow(workflow._id)}
                type="primary"
                className="px-3 py-1 text-sm"
                disabled={loading}
              >
                Run
              </Button>
              <Button
                onClick={() => handleDeleteWorkflow(workflow._id)}
                type="danger"
                className="px-3 py-1 text-sm"
                disabled={loading}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkflowManagement;
