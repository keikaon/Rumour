import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Rumour Backend API',
    version: '0.1.0',
    endpoints: {
      health: 'GET /api/health',
      buzzes: 'GET /api/buzzes',
      createBuzz: 'POST /api/buzzes'
    }
  });
});

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Rumour Backend is running' });
});

app.get('/api/buzzes', (req, res) => {
  // Placeholder for Firestore fetch logic
  res.json({ buzzes: [] });
});

app.post('/api/buzzes', (req, res) => {
  // Placeholder for Firestore create logic
  res.json({ message: 'Buzz created' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Rumour Backend running on port ${PORT}`);
});
