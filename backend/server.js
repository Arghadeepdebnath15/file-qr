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
          'https://qr-file-share.onrender.com',
          'https://qr-file-share-5ri5.onrender.com',
          'http://qr-file-share-5ri5.onrender.com',
          'https://qrtransfer.netlify.app'
        ]
      : [
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://localhost:5000',
          'http://127.0.0.1:5000',
          'http://192.168.1.4:3000',
          'http://192.168.1.4:5000'
        ];

    // Check if the origin is in our allowedOrigins array
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Convert both to URLs for proper comparison
      try {
        const allowedUrl = new URL(allowedOrigin);
        const originUrl = new URL(origin);
        return allowedUrl.origin === originUrl.origin;
      } catch {
        return false;
      }
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Device-Id', 'Accept', 'Origin'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware first
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-file-share';

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    retryReads: true
};

// Track MongoDB connection status
let isMongoConnected = false;

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
    isMongoConnected = true;
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
    isMongoConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
    isMongoConnected = false;
});

// Connect to MongoDB
const connectToMongo = async () => {
    try {
        await mongoose.connect(MONGODB_URI, mongooseOptions);
        console.log('MongoDB connected successfully to:', 
            process.env.NODE_ENV === 'production' 
                ? '[PRODUCTION_DB]' 
                : MONGODB_URI
        );
        isMongoConnected = true;
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        isMongoConnected = false;
    }
};

// Initial connection attempt
connectToMongo();

// Middleware to check MongoDB connection
app.use((req, res, next) => {
    if (!isMongoConnected && req.path.startsWith('/api/')) {
        return res.status(503).json({
            message: 'Database connection is not available. Please try again later.',
            error: 'MongoDB connection error'
        });
    }
    next();
});

// Production-specific middleware to ensure API routes are handled correctly
if (process.env.NODE_ENV === 'production') {
    // Add a middleware to properly handle API routes
    app.use('/api', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        // Add CORS headers for API routes
        res.setHeader('Access-Control-Allow-Origin', corsOptions.origin);
        res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
        res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', corsOptions.maxAge.toString());
        next();
    });
}

// API Routes
app.use('/api/files', fileRoutes);

// API health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: isMongoConnected ? 'ok' : 'degraded',
        message: isMongoConnected ? 'API is running' : 'API is running but database is not connected',
        database: isMongoConnected ? 'connected' : 'disconnected'
    });
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
    // Look for build files in the public directory first
    const publicPath = path.join(__dirname, 'public');
    const buildPath = path.join(__dirname, '../frontend/build');
    
    // Serve static files from public directory first, then try frontend/build
    app.use(express.static(publicPath));
    app.use(express.static(buildPath));

    // Catch-all route for frontend - MUST come after API routes
    app.get('*', (req, res, next) => {
        // If this is an API request that wasn't caught by previous routes, return 404
        if (req.url.startsWith('/api/')) {
            return res.status(404).json({ 
                status: 'error',
                message: 'API endpoint not found' 
            });
        }

        // Try to serve index.html from public directory first
        const publicIndexPath = path.join(publicPath, 'index.html');
        const buildIndexPath = path.join(buildPath, 'index.html');

        if (require('fs').existsSync(publicIndexPath)) {
            res.sendFile(publicIndexPath);
        } else if (require('fs').existsSync(buildIndexPath)) {
            res.sendFile(buildIndexPath);
        } else {
            res.status(503).json({ 
                message: 'Application is starting up. If this persists, please contact support.',
                details: process.env.NODE_ENV === 'development' ? 'Frontend build not found at: ' + publicPath : undefined
            });
        }
    });
}

// Final error handler
app.use((err, req, res, next) => {
    // Check if headers have been sent
    if (res.headersSent) {
        return next(err);
    }

    console.error('Unhandled Error:', err.message);
    
    // Set proper content type based on request path
    const isApiRequest = req.path.startsWith('/api/');
    res.setHeader('Content-Type', isApiRequest ? 'application/json' : 'text/html');

    if (isApiRequest) {
        res.status(500).json({ 
            message: 'Something went wrong!',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            database: isMongoConnected ? 'connected' : 'disconnected'
        });
    } else {
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Available endpoints:');
    console.log('- GET /api/health');
    console.log('- GET /api/files/recent');
    console.log('- POST /api/files/upload');
}); 