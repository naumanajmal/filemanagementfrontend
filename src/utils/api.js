// src/utils/api.js

import axios from 'axios';

// Base URL for your API (adjust the URL to your backend)
const BASE_URL = 'http://http://138.68.71.102:5001'; // Replace with your API URL

// Function to handle user registration
export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

// Function to handle user login
export const loginUser = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};



