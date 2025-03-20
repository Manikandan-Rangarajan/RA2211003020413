const axios = require('axios');

// Configuration
const WINDOW_SIZE = 10;
const TIMEOUT = 500; // in milliseconds
const API_BASE_URL = 'http://20.244.56.144/numbers';

// Authentication details
const AUTH = {
  token_type: 'Bearer',
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNDc1NDc0LCJpYXQiOjE3NDI0NzUxNzQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA1OGIwOTE1LWYyNTktNGFjNC05ZjJhLTYwOTRlMmIzOTg4YSIsInN1YiI6Im1yNjUzOUBzcm1pc3QuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiZ29NYXJ0IiwiY2xpZW50SUQiOiIwNThiMDkxNS1mMjU5LTRhYzQtOWYyYS02MDk0ZTJiMzk4OGEiLCJjbGllbnRTZWNyZXQiOiJTZnRhVGxuanJwTGFiaktOIiwib3duZXJOYW1lIjoiTWFuaWthbmRhbiIsIm93bmVyRW1haWwiOiJtcjY1MzlAc3JtaXN0LmVkdS5pbiIsInJvbGxObyI6IlJBMjIxMTAwMzAyMDQxMyJ9.b163VvqrZN7fmDozzFMSNbX3YkQ6GUW0twWAMGe5X04',
  expires_in: 1742475474
};

// Store for the numbers
let windowState = [];

// Mock data for testing when the API is unavailable
const mockData = {
  'p': [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],  // Prime numbers
  'f': [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],    // Fibonacci numbers
  'e': [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],  // Even numbers
  'r': [14, 27, 36, 49, 55, 61, 73, 82, 95, 100]  // Random numbers
};

/**
 * Validates if the number ID is among the accepted types
 * @param {string} numberId - The ID to validate ('p', 'f', 'e', 'r')
 * @returns {boolean} - Whether the ID is valid
 */
const isValidNumberId = (numberId) => {
  return ['p', 'f', 'e', 'r'].includes(numberId);
};

/**
 * Fetches numbers from the third-party server with authentication
 * @param {string} numberId - Type of numbers to fetch ('p', 'f', 'e', 'r')
 * @returns {Promise<Array>} - Array of numbers or mock data on error
 */
const fetchNumbers = async (numberId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${numberId}`, { 
      timeout: TIMEOUT,
      headers: {
        'Authorization': `${AUTH.token_type} ${AUTH.access_token}`
      }
    });
    console.log(`Successfully fetched ${numberId} numbers from API`);
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching ${numberId} numbers from API: ${error.message}`);
    console.log(`Using mock data for ${numberId} numbers`);
    // Return mock data if API fails
    return mockData[numberId] || [];
  }
};

/**
 * Updates window state with new numbers and calculates average
 * @param {Array} newNumbers - New numbers to add to window state
 * @returns {Object} - Object containing window states and average
 */
const updateWindowState = (newNumbers) => {
  // Ensure uniqueness
  const uniqueNumbers = [...new Set(newNumbers)];
  
  // Store previous state for response
  const windowPrevState = [...windowState];
  
  // Add new numbers to window state
  windowState = [...windowState, ...uniqueNumbers];
  
  // Keep only window size elements, remove oldest if exceeding
  if (windowState.length > WINDOW_SIZE) {
    windowState = windowState.slice(-WINDOW_SIZE);
  }
  
  // Calculate average
  const sum = windowState.reduce((acc, num) => acc + num, 0);
  const average = windowState.length > 0 ? sum / windowState.length : 0;
  
  return {
    windowPrevState,
    windowState,
    numbers: uniqueNumbers,
    average: average.toFixed(2)
  };
};

/**
 * Main function to fetch numbers and calculate average
 * @param {string} numberId - Type of numbers to fetch ('p', 'f', 'e', 'r')
 * @returns {Promise<Object>} - Result object with window states and average
 */
const fetchAndCalculateAverage = async (numberId) => {
  if (!isValidNumberId(numberId)) {
    throw new Error('Invalid numberId. Use "p" for prime, "f" for Fibonacci, "e" for even, or "r" for random.');
  }
  
  const newNumbers = await fetchNumbers(numberId);
  return updateWindowState(newNumbers);
};

// Reset window state (useful for testing)
const resetWindowState = () => {
  windowState = [];
  return { status: 'Window state reset' };
};

module.exports = { 
  fetchAndCalculateAverage,
  isValidNumberId,
  resetWindowState
};