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

app.use(cors(corsOptions));

// Add CORS preflight
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with better error handling
const MONGODB_URI = process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI
    : 'mongodb://localhost:27017/qr-file-share';

// Add connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

mongoose.connect(MONGODB_URI, mongooseOptions)
.then(() => {
    // Don't log the full connection string in production
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

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB error after initial connection:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
});

// API Routes - these should be handled before the static files
app.use('/api/files', fileRoutes);

// API health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Ensure the build directory exists
    const buildPath = path.join(__dirname, '../frontend/build');
    
    // Set static folder
    app.use(express.static(buildPath));

    // Handle frontend routes
    app.get('*', (req, res) => {
        // If the request is for the API, don't try to serve frontend files
        if (req.url.startsWith('/api/')) {
            return res.status(404).json({ message: 'API endpoint not found' });
        }

        const indexPath = path.join(buildPath, 'index.html');
        // Check if the file exists before sending
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Log the environment and available endpoints
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Available endpoints:');
    console.log('- GET /api/health');
    console.log('- GET /api/files/recent');
    console.log('- POST /api/files/upload');
}); 