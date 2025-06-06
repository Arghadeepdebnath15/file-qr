const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          'https://qr-file-share-5ri5.onrender.com',
          'https://qr-file-share.onrender.com'
        ]
      : [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:5000',
          'http://127.0.0.1:5000',
          'http://192.168.1.4:3000',
          'http://192.168.1.4:5000'
        ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Device-Id'],
  credentials: true // Allow credentials
};

// Apply CORS middleware first
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const MONGODB_URI = process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI
    : 'mongodb://localhost:27017/qr-file-share';

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

mongoose.connect(MONGODB_URI, mongooseOptions)
.then(() => {
    console.log('MongoDB connected successfully to:', 
        process.env.NODE_ENV === 'production' 
            ? '[PRODUCTION_DB]' 
            : MONGODB_URI
    );
})
.catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error after initial connection:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
});

// API Routes - must come before static file serving
app.use('/api/files', fileRoutes);

// API health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Error handling middleware for API routes
app.use('/api', (err, req, res, next) => {
    console.error('API Error:', err.message);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Ensure the build directory exists
    const buildPath = path.join(__dirname, '../frontend/build');
    
    // Serve static files
    app.use(express.static(buildPath));

    // Handle frontend routes - but NOT /api routes
    app.get('/*', (req, res, next) => {
        // Skip this middleware if it's an API request
        if (req.url.startsWith('/api/')) {
            return next();
        }

        const indexPath = path.join(buildPath, 'index.html');
        if (require('fs').existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(503).json({ 
                message: 'Application is starting up. If this persists, please contact support.',
                details: process.env.NODE_ENV === 'development' ? 'Frontend build not found at: ' + buildPath : undefined
            });
        }
    });
}

// Final error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.message);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Available endpoints:');
    console.log('- GET /api/health');
    console.log('- GET /api/files/recent');
    console.log('- POST /api/files/upload');
}); 