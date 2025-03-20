import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 9876;

const USER_API_URL = 'http://20.244.56.144/test/users';

app.get('/users', async (req, res) => {
  try {
    const response = await axios.get(USER_API_URL);
    const users = response.data.users;

    const topUsers = Object.entries(users)
      .sort((a, b) => b[1].posts - a[1].posts)
      .slice(0, 5)
      .map(user => ({ id: user[0], name: user[1].name, posts: user[1].posts }));

    res.json({ topUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/posts', async (req, res) => {
  const { type } = req.query;
  const POST_API_URL = `http://20.244.56.144/test/posts?type=${type}`;

  if (!['popular', 'latest'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Use "popular" or "latest".' });
  }

  try {
    const response = await axios.get(POST_API_URL);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.listen(PORT, () => {
  console.log(`Social Media running on http://localhost:${PORT}`);
});
