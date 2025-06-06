const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const QRCode = require('qrcode');
const File = require('../models/File');
const RecentHistory = require('../models/RecentHistory');

// Configure multer for file upload with quality preservation
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        // Preserve original file extension
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${Date.now()}${ext}`);
    }
});

// Configure multer with limits and file filter
const upload = multer({
    storage: storage,
    preservePath: true, // Preserve full path of files
    limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept all file types but verify file integrity
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|rar|txt|mp3|mp4|mov|avi|wav|psd|ai|eps/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('File type not supported! Please upload a valid file.'));
    }
});

// Get recent files
router.get('/recent', async (req, res) => {
    try {
        const files = await File.find()
            .sort({ uploadDate: -1 })  // Sort by upload date, newest first
            .limit(10);                // Limit to 10 most recent files
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recent files', error: error.message });
    }
});

// Get recent files for specific device
router.get('/recent/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        let history = await RecentHistory.findOne({ deviceId }).populate('fileIds');
        
        if (!history) {
            history = { fileIds: [] };
        }

        res.json(history.fileIds);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recent files', error: error.message });
    }
});

// Upload file and generate QR code
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const downloadUrl = `${baseUrl}/api/files/download/${req.file.filename}`;
        
        // Generate QR code
        const qrCode = await QRCode.toDataURL(downloadUrl);

        const file = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            qrCode: qrCode
        });

        await file.save();

        // Add to device's recent history if deviceId is provided
        const deviceId = req.headers['device-id'];
        if (deviceId) {
            await RecentHistory.findOneAndUpdate(
                { deviceId },
                { 
                    $push: { 
                        fileIds: { 
                            $each: [file._id],
                            $position: 0,
                            $slice: 10
                        }
                    }
                },
                { upsert: true }
            );
        }

        res.status(201).json({ file, qrCode });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
});

// Mobile upload page route
router.get('/upload-page', (req, res) => {
    // Send a simple HTML form for mobile uploads
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Upload File</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }
            .upload-container {
                max-width: 500px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
                color: #1976d2;
                text-align: center;
            }
            .file-input {
                margin: 20px 0;
                width: 100%;
            }
            .submit-btn {
                background-color: #1976d2;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                font-size: 16px;
            }
            .submit-btn:hover {
                background-color: #1565c0;
            }
            .status {
                margin-top: 20px;
                text-align: center;
                color: #666;
            }
            .files-list {
                margin-top: 20px;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
            .file-item {
                padding: 10px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .file-name {
                font-weight: 500;
            }
            .file-date {
                color: #666;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="upload-container">
            <h1>Upload File</h1>
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" name="file" class="file-input" required>
                <button type="submit" class="submit-btn">Upload</button>
            </form>
            <div id="status" class="status"></div>
            <div id="filesList" class="files-list"></div>
        </div>
        <script>
            // Function to format date
            function formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleString();
            }

            // Function to fetch and display recent files
            async function fetchRecentFiles() {
                try {
                    const response = await fetch('/api/files/recent');
                    const files = await response.json();
                    const filesList = document.getElementById('filesList');
                    
                    if (files.length === 0) {
                        filesList.innerHTML = '<div style="text-align: center; color: #666;">No files uploaded yet</div>';
                        return;
                    }

                    filesList.innerHTML = files.map(file => \`
                        <div class="file-item">
                            <div class="file-name">\${file.originalName}</div>
                            <div class="file-date">\${formatDate(file.uploadDate)}</div>
                        </div>
                    \`).join('');
                } catch (error) {
                    console.error('Error fetching files:', error);
                }
            }

            // Fetch files on page load
            fetchRecentFiles();

            document.getElementById('uploadForm').onsubmit = async (e) => {
                e.preventDefault();
                const status = document.getElementById('status');
                status.textContent = 'Uploading...';
                
                const formData = new FormData(e.target);
                try {
                    const response = await fetch('/api/files/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    if (response.ok) {
                        status.textContent = 'File uploaded successfully!';
                        status.style.color = '#4caf50';
                        // Refresh the files list
                        fetchRecentFiles();
                        // Reset the form
                        e.target.reset();
                    } else {
                        throw new Error(data.message || 'Upload failed');
                    }
                } catch (error) {
                    status.textContent = 'Error: ' + error.message;
                    status.style.color = '#f44336';
                }
            };
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// Download file
router.get('/download/:filename', async (req, res) => {
    try {
        const file = await File.findOne({ filename: req.params.filename });
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Increment download count
        file.downloadCount += 1;
        await file.save();

        res.download(file.path, file.originalName);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading file', error: error.message });
    }
});

// Get file info
router.get('/info/:filename', async (req, res) => {
    try {
        const file = await File.findOne({ filename: req.params.filename });
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.json(file);
    } catch (error) {
        res.status(500).json({ message: 'Error getting file info', error: error.message });
    }
});

// Get device-specific files
router.post('/device-files', async (req, res) => {
  try {
    const { fileIds } = req.body;
    
    if (!Array.isArray(fileIds)) {
      return res.status(400).json({ message: 'fileIds must be an array' });
    }

    const files = await File.find({
      '_id': { $in: fileIds }
    }).sort({ uploadDate: -1 });

    res.json(files);
  } catch (error) {
    console.error('Error fetching device files:', error);
    res.status(500).json({ message: 'Error fetching device files' });
  }
});

// Clear recent history for a device
router.post('/clear-recent-history', async (req, res) => {
    try {
        const { deviceId } = req.body;
        await RecentHistory.findOneAndDelete({ deviceId });
        res.json({ message: 'Recent history cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing recent history', error: error.message });
    }
});

// Add file to device's recent history
router.post('/add-to-recent/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { fileId } = req.body;

        let history = await RecentHistory.findOne({ deviceId });
        
        if (!history) {
            history = new RecentHistory({
                deviceId,
                fileIds: [fileId]
            });
        } else {
            // Keep only the 10 most recent files
            if (!history.fileIds.includes(fileId)) {
                history.fileIds.unshift(fileId);
                if (history.fileIds.length > 10) {
                    history.fileIds = history.fileIds.slice(0, 10);
                }
            }
        }

        await history.save();
        res.json({ message: 'File added to recent history' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating recent history', error: error.message });
    }
});

module.exports = router; 