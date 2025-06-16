import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_BASE_URL}api/v1/`;

// LOGIN
export const loginUser = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}users/login`,
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// LOGOUT
export const logoutUser = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}users/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// REGISTER
export const registerUser = async (formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}users/register`,
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// REFRESH TOKEN
export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}users/refresh-token`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// GET CURRENT USER
export const fetchCurrentUser = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}users/current-user`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// GET SAVED PROJECTS
export const getSavedProjects = async () => {
  try {
    const response = await axios.get(`${BASE_URL}users/save-projects`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

// ADD PROJECT TO SAVED
export const addProject = async (projectId) => {
  try {
    const response = await axios.post(`${BASE_URL}users/add/project`, { projectId }, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.message || error.message);
    throw error.response?.data || error;
  }
};

const getAuthHeaders = () => {
    const accessToken = localStorage.getItem('token'); 
    if (accessToken) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };
    }
    return { 'Content-Type': 'application/json' };
};

// --- Connections API Calls ---
export const createConnectionApi = async (connectionData) => {
    const response = await fetch(`${BASE_URL}connections`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(connectionData),
    });
    return response.json();
};

export const getConnectionsApi = async () => {
    const response = await fetch(`${BASE_URL}connections`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const updateConnectionApi = async (id, connectionData) => {
    const response = await fetch(`${BASE_URL}connections/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(connectionData),
    });
    return response.json();
};

export const deleteConnectionApi = async (id) => {
    const response = await fetch(`${BASE_URL}connections/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return response.json();
};

// --- Workflows API Calls ---
export const createWorkflowApi = async (workflowData) => {
    const response = await fetch(`${BASE_URL}workflows`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(workflowData),
    });
    return response.json();
};

export const getWorkflowsApi = async () => {
    const response = await fetch(`${BASE_URL}workflows`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const getWorkflowByIdApi = async (id) => {
    const response = await fetch(`${BASE_URL}workflows/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const updateWorkflowApi = async (id, workflowData) => {
    const response = await fetch(`${BASE_URL}workflows/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(workflowData),
    });
    return response.json();
};

export const deleteWorkflowApi = async (id) => {
    const response = await fetch(`${BASE_URL}workflows/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return response.json();
};

// --- Workflow Execution API Calls ---
export const runWorkflowApi = async (workflowId, inputData) => {
    const response = await fetch(`${BASE_URL}executions/run`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ workflowId, inputData }),
    });
    return response.json();
};

export const getWorkflowExecutionsApi = async (workflowId = '') => {
    const query = workflowId ? `?workflowId=${workflowId}` : '';
    const response = await fetch(`${BASE_URL}executions${query}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const getWorkflowExecutionByIdApi = async (id) => {
    const response = await fetch(`${BASE_URL}executions/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};
