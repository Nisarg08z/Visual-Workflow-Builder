import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionManagement from '../components/connection/ConnectionManagement';
import WorkflowManagement from '../components/workflow/WorkflowManagement';
import ExecutionHistory from '../components/execution/ExecutionHistory';
import { UserContext } from '../contexts/UserContext';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';

const WorkflowHistoryPage = () => {
  const { isLogedin, userDetail } = useContext(UserContext);
  const navigate = useNavigate();
  const [refreshExecutions, setRefreshExecutions] = useState(0);

  const showToastMessage = useCallback((text, type = 'info') => {
    switch (type) {
      case 'success':
        toast.success(text);
        break;
      case 'error':
        toast.error(text);
        break;
      case 'info':
        toast(text, { icon: 'ℹ️' });
        break;
      default:
        toast(text);
    }
  }, []);

  const handleWorkflowRunSuccess = () => {
    setRefreshExecutions((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isLogedin) {
      toast.error('You must be logged in to view history and manage projects.');
      navigate('/login');
    }
  }, [isLogedin, navigate]);

  if (!isLogedin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your workflow history and manage connections.</p>
          <Button onClick={() => navigate('/login')} type="primary">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ConnectionManagement showMessage={showToastMessage} />
        <WorkflowManagement
          showMessage={showToastMessage}
          onWorkflowRun={handleWorkflowRunSuccess}
        />
        <ExecutionHistory
          showMessage={showToastMessage}
          refreshTrigger={refreshExecutions}
        />
      </div>
    </div>
  );
};

export default WorkflowHistoryPage;
