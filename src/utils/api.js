// src/utils/api.js

import axios from 'axios';

// Base URL for your API (adjust the URL to your backend)
const BASE_URL = 'http://46.101.155.18:5002/api'; // Replace with your API URL


// Function to handle user registration
export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

// Function to handle user login
export const loginUser = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};



