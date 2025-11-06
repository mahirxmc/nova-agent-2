const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 1000;

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routes - send all routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Nova Agent running on port ${port}`);
  console.log(`🌐 Serving static files from: ${path.join(__dirname, 'dist')}`);
});