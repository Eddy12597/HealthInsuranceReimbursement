const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database (replace with real database in production)
let userFavorites = {
  // Format: { "openid": ["favorite1", "favorite2", ...] }
  "test_openid": [] // Initialize with empty array for the test user
};

// Get favorites endpoint
app.get('/getFavorites', (req, res) => {
  const { openid } = req.query;
  
  if (!openid) {
    return res.status(400).json({ error: 'openid is required' });
  }

  // If user doesn't exist in our "database", initialize with empty array
  if (!userFavorites[openid]) {
    userFavorites[openid] = [];
  }

  res.json({ 
    success: true,
    favorites: userFavorites[openid] 
  });
});

// Set favorites endpoint
app.post('/setFavorites', (req, res) => {
  const { openid, favorites } = req.body;
  
  if (!openid || !Array.isArray(favorites)) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  // Update or create the user's favorites
  userFavorites[openid] = favorites;

  res.json({ 
    success: true,
    message: 'Favorites updated successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Favorites server running on http://localhost:${PORT}`);
});