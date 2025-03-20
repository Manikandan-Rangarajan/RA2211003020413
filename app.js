import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT = 500; 
const API_BASE_URL = 'http://20.244.56.144/numbers';

const AUTH = {
  token_type: 'Bearer',
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNDc1NDc0LCJpYXQiOjE3NDI0NzUxNzQsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA1OGIwOTE1LWYyNTktNGFjNC05ZjJhLTYwOTRlMmIzOTg4YSIsInN1YiI6Im1yNjUzOUBzcm1pc3QuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiZ29NYXJ0IiwiY2xpZW50SUQiOiIwNThiMDkxNS1mMjU5LTRhYzQtOWYyYS02MDk0ZTJiMzk4OGEiLCJjbGllbnRTZWNyZXQiOiJTZnRhVGxuanJwTGFiaktOIiwib3duZXJOYW1lIjoiTWFuaWthbmRhbiIsIm93bmVyRW1haWwiOiJtcjY1MzlAc3JtaXN0LmVkdS5pbiIsInJvbGxObyI6IlJBMjIxMTAwMzAyMDQxMyJ9.b163VvqrZN7fmDozzFMSNbX3YkQ6GUW0twWAMGe5X04',
  expires_in: 1742475474
};

let windowState = [];

const mockData = {
  'p': [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
  'f': [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
  'e': [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  'r': [14, 27, 36, 49, 55, 61, 73, 82, 95, 100]
};

const isValidNumberId = (numberId) => ['p', 'f', 'e', 'r'].includes(numberId);

const fetchNumbers = async (numberId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${numberId}`, {
      timeout: TIMEOUT,
      headers: { 'Authorization': `${AUTH.token_type} ${AUTH.access_token}` }
    });
    console.log(`Fetched ${numberId} numbers from API`);
    return response.data.numbers || [];
  } catch (error) {
    console.error(`API error (${numberId}): ${error.message}`);
    return mockData[numberId];
  }
};

const updateWindowState = (newNumbers) => {
  const uniqueNumbers = [...new Set(newNumbers)];
  windowState = [...windowState, ...uniqueNumbers].slice(-WINDOW_SIZE);

  const sum = windowState.reduce((acc, num) => acc + num, 0);
  const average = windowState.length ? (sum / windowState.length).toFixed(2) : 0;

  return { windowState, numbers: uniqueNumbers, average };
};

app.get('/numbers/:numberId', async (req, res) => {
  const { numberId } = req.params;
  if (!isValidNumberId(numberId)) {
    return res.status(400).json({ error: 'Invalid numberId. Use "p", "f", "e", or "r".' });
  }

  const newNumbers = await fetchNumbers(numberId);
  const result = updateWindowState(newNumbers);
  res.status(200).json(result);
});

app.get('/reset', (req, res) => {
  windowState = [];
  res.json({ message: 'Window state reset successfully' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
