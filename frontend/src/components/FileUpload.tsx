import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  alpha,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  ButtonGroup,
  Paper,
  Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { API_URL, CONFIG } from '../config';
import { Zoom } from '@mui/material';

interface ErrorState {
  show: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<ErrorState>({ show: false, message: '', severity: 'error' });
  const [shareError, setShareError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const validateFile = (file: File): string | null => {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      return `File size exceeds ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
    }

    // Check if file type is allowed
    const fileType = file.type || '';
    const isAllowed = CONFIG.ALLOWED_FILE_TYPES.some(type => {
      if (type.endsWith('/*')) {
        // Handle wildcard mime types (e.g., 'image/*')
        return fileType.startsWith(type.replace('/*', '/'));
      }
      return type === fileType;
    });

    if (!isAllowed) {
      return 'File type not allowed';
    }

    return null;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    
    const validationError = validateFile(droppedFile);
    if (validationError) {
      setError({ show: true, message: validationError, severity: 'error' });
      return;
    }
    
    setFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError({ show: true, message: validationError, severity: 'error' });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setUploadProgress(0);

    try {
      const deviceId = getDeviceId();
      const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Device-Id': deviceId,
          'Accept': 'application/json'
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(Math.round(progress));
          }
        },
        // Add timeout and retry configuration
        timeout: 60000, // 60 seconds for large files
        validateStatus: (status) => status < 500, // Don't reject if status < 500
        maxContentLength: Infinity, // Allow large files
        maxBodyLength: Infinity // Allow large files
      });

      if (response.status !== 201 && response.status !== 200) {
        throw new Error(response.data?.message || 'Upload failed');
      }

      // Ensure we have the correct URL format
      const fileData = response.data.file;
      const qrCode = response.data.qrCode;
      
      // Use the API_URL for the download URL to ensure correct domain
      const downloadUrl = `${API_URL}/api/files/download/${fileData.filename}`;
      
      setQrCode(qrCode);
      setDownloadUrl(downloadUrl);
      
      // Update recent history in localStorage
      const currentHistory = JSON.parse(localStorage.getItem('recentHistory') || '[]');
      currentHistory.unshift({
        ...fileData,
        url: downloadUrl // Ensure the URL is correct
      });
      if (currentHistory.length > 10) {
        currentHistory.length = 10;
      }
      localStorage.setItem('recentHistory', JSON.stringify(currentHistory));
      
      setShowQR(true);
      setError({ show: true, message: 'File uploaded successfully!', severity: 'success' });
      
      // Clear the file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      let errorMessage = 'Error uploading file. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || error.response.statusText;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      setError({ show: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try using the Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback: Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        textArea.remove();
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  const handleShare = async () => {
    if (!downloadUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Download File',
          text: 'Scan this QR code or use the link to download the file',
          url: downloadUrl,
        });
      } else {
        const copied = await copyToClipboard(downloadUrl);
        if (copied) {
          setError({ show: true, message: 'Link copied to clipboard!', severity: 'success' });
        } else {
          throw new Error('Failed to copy to clipboard');
        }
      }
    } catch (err) {
      console.error('Error sharing:', err);
      setShareError('Failed to share');
      setTimeout(() => setShareError(''), 3000);
    }
  };

  return (
    <>
      <Card
        sx={{
          mt: 2,
          p: 2,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : alpha(theme.palette.primary.main, 0.2),
          backgroundColor: isDragging 
            ? alpha(theme.palette.primary.main, 0.05) 
            : theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.6)
              : theme.palette.background.paper,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            transform: 'translateY(-2px)',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent 
          sx={{ 
            textAlign: 'center',
            minHeight: '250px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <CloudUploadIcon 
            sx={{ 
              fontSize: 80, 
              color: isDragging ? 'primary.main' : theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              mb: 3,
              transition: 'all 0.3s ease',
            }} 
          />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to select a file
          </Typography>
          {file && (
            <Box 
              sx={{ 
                mt: 2,
                p: 2,
                bgcolor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <Typography variant="body1" color="primary" sx={{ fontWeight: 500 }}>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Size: {formatFileSize(file.size)}
              </Typography>
            </Box>
          )}
          {loading && (
            <Box sx={{ mt: 3, width: '100%', maxWidth: '400px' }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundImage: 'linear-gradient(45deg, #2962ff 30%, #7c4dff 90%)',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Uploading: {uploadProgress}%
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {file && !loading && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={loading}
            sx={{
              minWidth: 200,
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2962ff 30%, #7c4dff 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1e4cff 30%, #6b3dff 90%)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload File'}
          </Button>
        </Box>
      )}

      <Dialog 
        open={showQR} 
        onClose={() => setShowQR(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: '24px',
            p: 3,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              opacity: 1,
              transition: 'opacity 0.4s ease',
            },
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 0,
            mb: 3,
            position: 'relative',
          }}
        >
          <Typography 
            variant="h5"
            sx={{
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #768fff 30%, #b47cff 90%)'
                : 'linear-gradient(45deg, #2962ff 30%, #7c4dff 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            Scan QR Code to Download
          </Typography>
          <ButtonGroup 
            variant="outlined" 
            size="small"
            sx={{
              '& .MuiButtonGroup-grouped': {
                borderColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.main, 0.3)
                  : alpha(theme.palette.primary.main, 0.2),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              },
            }}
          >
            <Tooltip title="Copy Link" arrow>
              <IconButton 
                onClick={async () => {
                  const copied = await copyToClipboard(downloadUrl);
                  if (copied) {
                    setError({ show: true, message: 'Link copied to clipboard!', severity: 'success' });
                  } else {
                    setShareError('Failed to copy to clipboard');
                    setTimeout(() => setShareError(''), 3000);
                  }
                }}
                size="small"
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share" arrow>
              <IconButton 
                onClick={handleShare}
                size="small"
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 0 }}>
          {qrCode && (
            <Fade in timeout={500}>
              <Box sx={{ mt: 2 }}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    bgcolor: '#fff',
                    borderRadius: '20px',
                    display: 'inline-block',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: theme.shadows[8],
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -100,
                      left: -100,
                      right: -100,
                      bottom: -100,
                      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    },
                  }}
                >
                  <QRCode value={downloadUrl} size={256} />
                </Paper>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 4, 
                    mb: 2, 
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    opacity: 0.9,
                  }}
                >
                  Scan this QR code to download the file
                </Typography>
                <Paper
                  elevation={2}
                  sx={{ 
                    mt: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 2,
                    display: 'inline-block',
                    maxWidth: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Typography 
                    variant="body2" 
                    color="primary"
                    sx={{ 
                      wordBreak: 'break-all',
                      fontFamily: 'monospace',
                      fontWeight: 500,
                    }}
                  >
                    {downloadUrl}
                  </Typography>
                </Paper>
                {shareError && (
                  <Fade in timeout={200}>
                    <Typography 
                      variant="body2" 
                      color="error" 
                      sx={{ 
                        mt: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      {shareError}
                    </Typography>
                  </Fade>
                )}
              </Box>
            </Fade>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar 
        open={error.show} 
        autoHideDuration={6000} 
        onClose={() => setError({ ...error, show: false })}
      >
        <Alert 
          onClose={() => setError({ ...error, show: false })} 
          severity={error.severity}
          sx={{ width: '100%' }}
        >
          {error.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileUpload; 