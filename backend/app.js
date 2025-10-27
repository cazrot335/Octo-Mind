require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./config/firebase');
const taskRoutes = require('./routes/taskRoutes');
const emotionRoutes = require('./routes/emotionRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Allow localhost during development and allow a production frontend URL via env var FRONTEND_URL
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (like curl/postman) which have no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow access from the specified origin.'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase
initializeFirebase();

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/schedule', schedulerRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Octo-Mind Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔥 Firebase connected`);
  console.log(`🤖 AI Provider: ${process.env.AI_PROVIDER || 'groq'}`);
  
  if (process.env.AI_PROVIDER === 'ollama') {
    console.log(`   Model: ${process.env.OLLAMA_MODEL || 'llama3.2'}`);
  } else if (process.env.AI_PROVIDER === 'groq') {
    console.log(`   ⚡ Groq AI (Super Fast & Free!)`);
  }
});

module.exports = app;
