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
  origin: process.env.NODE_ENV === 'production'
    ? ['https://qr-file-share-5ri5.onrender.com']
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.4:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://192.168.1.4:5000'
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Device-Id']
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

// Routes
app.use('/api/files', fileRoutes);

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

    app.get('*', (req, res) => {
        const indexPath = path.join(buildPath, 'index.html');
        // Check if the file exists before sending
        if (require('fs').existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.status(404).json({ 
                message: 'Frontend build not found. Please ensure the frontend is built before starting the server.'
            });
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 