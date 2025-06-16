import React, { useState, useEffect, useContext } from 'react';
import {
  createConnectionApi,
  getConnectionsApi,
  updateConnectionApi,
  deleteConnectionApi
} from '../../utils/api';
import { UserContext } from '../../contexts/UserContext';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import ConnectionForm from './ConnectionForm';

const ConnectionManagement = () => {
  const { isLogedin } = useContext(UserContext);
  const [connections, setConnections] = useState([]);
  const [newConnection, setNewConnection] = useState({
    connectionName: '',
    serviceType: '',
    credentials: ''
  });
  const [editingConnectionId, setEditingConnectionId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLogedin) fetchConnections();
    else setConnections([]);
  }, [isLogedin]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const data = await getConnectionsApi();
      if (data.success) setConnections(data.data);
      else toast.error(data.message || 'Error fetching connections.');
    } catch (error) {
      toast.error(error.message || 'Network error fetching connections.');
      console.error('Fetch Connections Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let parsedCredentials;
      try {
        parsedCredentials = JSON.parse(newConnection.credentials);
      } catch {
        toast.error('Credentials must be valid JSON.');
        setLoading(false);
        return;
      }

      const payload = {
        connectionName: newConnection.connectionName,
        serviceType: newConnection.serviceType,
        credentials: parsedCredentials
      };

      const response = editingConnectionId
        ? await updateConnectionApi(editingConnectionId, payload)
        : await createConnectionApi(payload);

      if (response.success) {
        toast.success(response.message || 'Connection saved successfully!');
        setNewConnection({ connectionName: '', serviceType: '', credentials: '' });
        setEditingConnectionId(null);
        fetchConnections();
      } else {
        toast.error(response.message || 'Failed to save connection.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save connection.');
      console.error('Save Connection Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (id) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      setLoading(true);
      try {
        const data = await deleteConnectionApi(id);
        if (data.success) {
          toast.success('Connection deleted.');
          fetchConnections();
        } else {
          toast.error(data.message || 'Error deleting connection.');
        }
      } catch (error) {
        toast.error(error.message || 'Network error deleting connection.');
        console.error('Delete Connection Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const startEditing = (conn) => {
    setEditingConnectionId(conn._id);
    setNewConnection({
      connectionName: conn.connectionName,
      serviceType: conn.serviceType,
      credentials: JSON.stringify(conn.credentials, null, 2)
    });
  };

  const cancelEdit = () => {
    setEditingConnectionId(null);
    setNewConnection({ connectionName: '', serviceType: '', credentials: '' });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl w-full mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-blue-700">Manage Connections</h3>

      {/* 👇 Use the new form component */}
      <ConnectionForm
        newConnection={newConnection}
        setNewConnection={setNewConnection}
        handleFormSubmit={handleFormSubmit}
        editingConnectionId={editingConnectionId}
        loading={loading}
        isLogedin={isLogedin}
        cancelEdit={cancelEdit}
      />

      {/* List of connections */}
      <div className="mt-8">
        {loading && <p className="text-center text-gray-500">Loading connections...</p>}
        {!loading && connections.length === 0 && isLogedin && (
          <p className="text-center text-gray-500">No connections found.</p>
        )}
        {!isLogedin && (
          <p className="text-center text-red-500 mt-4">Please log in to manage connections.</p>
        )}
        <ul className="space-y-3 mt-4">
          {connections.map((conn) => (
            <li
              key={conn._id}
              className={`flex justify-between items-start bg-gray-50 p-4 rounded-md border shadow-sm flex-wrap gap-2 ${
                editingConnectionId === conn._id ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="w-full md:w-auto flex-grow">
                <p className="font-semibold text-gray-900">{conn.connectionName}</p>
                <p className="text-sm text-gray-600">Service: {conn.serviceType}</p>
                <p className="text-xs text-gray-500 truncate max-w-xs">ID: {conn._id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => startEditing(conn)}
                  type="info"
                  className="text-sm px-3 py-1"
                  disabled={loading}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteConnection(conn._id)}
                  type="danger"
                  className="text-sm px-3 py-1"
                  disabled={loading}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConnectionManagement;
