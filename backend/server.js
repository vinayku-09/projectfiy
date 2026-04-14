require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

// Import Routes
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth'); // Added for SQL-based Authentication

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing JSON project data 

// API Routes
// Handles Authentication: POST/api/auth/register, POST/api/auth/login
app.use('/api/auth', authRoutes);

// Handles Project APIs: POST/projects, GET/projects, DELETE/projects [cite: 24, 25, 27]
app.use('/api/projects', projectRoutes);

// Handles Task APIs: POST/projects/:project_id/tasks, GET/projects/:project_id/tasks, etc. [cite: 29, 30, 31, 33]
app.use('/api', taskRoutes);

// Basic Error Handling 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Internal Server Error' });
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
  🚀 Projectify Server Running
  ----------------------------
  Local: http://localhost:${PORT}
  Database: Connected
  `);
  });
}

module.exports = app;