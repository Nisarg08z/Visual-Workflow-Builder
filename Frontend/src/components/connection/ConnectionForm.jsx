// src/components/connection/ConnectionForm.jsx
import React from "react";
import Button from "../common/Button";

const ConnectionForm = ({
  newConnection,
  setNewConnection,
  handleFormSubmit,
  editingConnectionId,
  loading,
  isLogedin,
  cancelEdit,
}) => {
  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Connection Name</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={newConnection.connectionName}
          onChange={(e) => setNewConnection({ ...newConnection, connectionName: e.target.value })}
          placeholder="e.g., My Slack API"
          required
          disabled={loading || !isLogedin}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Service Type</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          value={newConnection.serviceType}
          onChange={(e) => setNewConnection({ ...newConnection, serviceType: e.target.value })}
          placeholder="e.g., Slack, GoogleSheets"
          required
          disabled={loading || !isLogedin}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Credentials (JSON)</label>
        <textarea
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24 font-mono text-xs"
          value={newConnection.credentials}
          onChange={(e) => setNewConnection({ ...newConnection, credentials: e.target.value })}
          placeholder='{"apiKey": "xyz123", "type": "API_Key"}'
          required
          disabled={loading || !isLogedin}
        ></textarea>
      </div>
      <Button type="primary" className="w-full" disabled={loading || !isLogedin}>
        {loading ? "Saving..." : editingConnectionId ? "Update Connection" : "Create Connection"}
      </Button>
      {editingConnectionId && (
        <Button type="secondary" onClick={cancelEdit} className="ml-2 w-full" disabled={loading || !isLogedin}>
          Cancel Edit
        </Button>
      )}
    </form>
  );
};

export default ConnectionForm;
