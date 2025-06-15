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
