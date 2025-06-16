import React, { useState, useEffect, useContext, useCallback } from 'react';
import { getWorkflowExecutionsApi, getWorkflowExecutionByIdApi } from '../../utils/api';
import { UserContext } from '../../contexts/UserContext';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import ExecutionDetailsModal from './ExecutionDetailsModal';

const ExecutionHistory = ({ refreshTrigger }) => {
  const { isLogedin } = useContext(UserContext);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState(null);

  const fetchExecutions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWorkflowExecutionsApi();
      if (data.success) {
        setExecutions(data.data);
      } else {
        toast.error(data.message || 'Error fetching execution history.');
      }
    } catch (error) {
      toast.error(error.message || 'Network error fetching execution history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLogedin) {
      fetchExecutions();
    } else {
      setExecutions([]);
    }
  }, [isLogedin, refreshTrigger, fetchExecutions]);

  const viewExecutionDetails = async (id) => {
    setLoading(true);
    try {
      const data = await getWorkflowExecutionByIdApi(id);
      if (data.success) {
        setSelectedExecution(data.data);
        setIsModalOpen(true);
      } else {
        toast.error(data.message || 'Error fetching execution details.');
      }
    } catch (error) {
      toast.error(error.message || 'Network error fetching execution details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
      <h3 className="text-xl font-semibold mb-4 text-purple-700">Workflow Execution History</h3>

      {loading && <p className="text-center text-gray-600">Loading executions...</p>}
      {!loading && executions.length === 0 && isLogedin && (
        <p className="text-center text-gray-600">No workflow executions found.</p>
      )}
      {!isLogedin && (
        <p className="text-center text-red-500">Please log in to view execution history.</p>
      )}

      <ul className="space-y-3 max-h-[500px] overflow-y-auto">
        {executions.map((exec) => (
          <li
            key={exec._id}
            className="bg-gray-50 p-4 rounded-md border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate" title={exec.workflowId?.workflowName}>
                {exec.workflowId?.workflowName || 'Unknown Workflow'}
              </p>
              <p className="text-sm text-gray-600">
                Executed At: {formatDateTime(exec.executedAt)}
              </p>
              <p className={`text-sm font-medium ${getStatusColor(exec.status)}`}>
                Status: {exec.status?.toUpperCase()}
              </p>
              <p className="text-xs text-gray-500">
                Duration: {exec.durationMs ? `${exec.durationMs}ms` : 'N/A'}
              </p>
            </div>
            <div className="shrink-0">
              <Button
                onClick={() => viewExecutionDetails(exec._id)}
                type="info"
                className="px-3 py-1 text-sm"
                disabled={loading}
              >
                View Details
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Clean, Reusable Modal */}
      <ExecutionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        execution={selectedExecution}
      />
    </div>
  );
};

export default ExecutionHistory;
