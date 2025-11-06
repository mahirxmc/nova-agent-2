import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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