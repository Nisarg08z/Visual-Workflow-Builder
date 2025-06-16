import React from "react";
import Modal from "../common/Modal";

const ExecutionDetailsModal = ({ isOpen, onClose, execution }) => {
  if (!execution) return null;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Execution Details">
      <div className="space-y-5 text-sm max-h-[80vh] overflow-y-auto pr-2">
        <div className="grid sm:grid-cols-2 gap-4">
          <p><strong>Workflow:</strong> {execution.workflowId?.workflowName || 'N/A'}</p>
          <p><strong>Execution ID:</strong> {execution._id}</p>
          <p><strong>User ID:</strong> {execution.userId}</p>
          <p><strong>Executed At:</strong> {formatDateTime(execution.executedAt)}</p>
          <p className={`font-semibold ${getStatusColor(execution.status)}`}>
            <strong>Status:</strong> {execution.status?.toUpperCase()}
          </p>
          <p><strong>Duration:</strong> {execution.durationMs || 'N/A'}ms</p>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Input Data</h4>
          <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(execution.inputData, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Output Data</h4>
          <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(execution.outputData, null, 2)}
          </pre>
        </div>

        {execution.error && (
          <div>
            <h4 className="font-semibold mb-1 text-red-600">Error</h4>
            <pre className="bg-red-50 p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap text-red-800">
              {JSON.stringify(execution.error, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-1">Logs</h4>
          <div className="bg-gray-900 text-gray-200 p-3 rounded-md text-xs overflow-y-auto max-h-64">
            {Array.isArray(execution.logs) && execution.logs.length > 0 ? (
              execution.logs.map((log, idx) => (
                <p key={idx} className={log.level === 'error' ? 'text-red-400' : ''}>
                  <span className="text-gray-400">[{formatDateTime(log.timestamp)}]</span>{' '}
                  <span className="uppercase">{log.level}</span>: {log.message}
                </p>
              ))
            ) : (
              <p>No logs available.</p>
            )}
          </div>
        </div>

        {execution.workflowId?.nodes && (
          <div>
            <h4 className="font-semibold mb-1">Workflow Definition Snapshot</h4>
            <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(
                {
                  nodes: execution.workflowId.nodes,
                  edges: execution.workflowId.edges,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExecutionDetailsModal;
