import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Container,
  Paper,
  alpha,
  useTheme,
  Fade,
  Grow,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { API_URL } from '../config';
import DeviceManager from './DeviceManager';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NoFilesIcon from '@mui/icons-material/FileCopy';

interface FileInfo {
  _id: string;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  downloadCount: number;
  uploadDate: string;
  qrCode: string;
}

const RecentFiles: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }, []);

  const fetchRecentFiles = useCallback(async () => {
    try {
      setLoading(true);
      const deviceId = getDeviceId();
      const response = await axios.get(`${API_URL}/api/files/recent/${deviceId}`);
      
      localStorage.setItem('recentHistory', JSON.stringify(response.data));
      
      setFiles(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your recent files');
      console.error('Error fetching recent files:', err);
    } finally {
      setLoading(false);
    }
  }, [getDeviceId]);

  const handleDownload = async (filename: string, originalName: string) => {
    try {
      const deviceId = getDeviceId();
      const fileInfo = files.find(f => f.filename === filename);
      if (fileInfo) {
        await axios.post(`${API_URL}/api/files/add-to-recent/${deviceId}`, {
          fileId: fileInfo._id
        });
      }
      window.open(`${API_URL}/api/files/download/${filename}`, '_blank');
    } catch (error) {
      console.error('Error updating recent history:', error);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
    const interval = setInterval(fetchRecentFiles, 30000);
    return () => clearInterval(interval);
  }, [fetchRecentFiles]);

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Are you sure you want to remove this file from your recent history?')) {
      try {
        const deviceId = getDeviceId();
        const updatedFiles = files.filter(f => f._id !== fileId);
        setFiles(updatedFiles);
        localStorage.setItem('recentHistory', JSON.stringify(updatedFiles));
        
        // Update backend
        await axios.post(`${API_URL}/api/files/remove-from-recent/${deviceId}`, {
          fileId
        });
      } catch (error) {
        console.error('Error removing file from history:', error);
        fetchRecentFiles(); // Refresh the list if there was an error
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all recent files from your history?')) {
      try {
        const deviceId = getDeviceId();
        await axios.post(`${API_URL}/api/files/clear-recent-history`, { deviceId });
        setFiles([]);
        localStorage.setItem('recentHistory', '[]');
      } catch (error) {
        console.error('Error clearing recent history:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleShowQR = (file: FileInfo) => {
    setSelectedFile(file);
    setShowQRDialog(true);
  };

  const theme = useTheme();

  if (loading) {
    return (
      <Container 
        maxWidth="xl"
        sx={{ 
          py: 2,
          px: { xs: 2, sm: 3 },
          bgcolor: 'transparent',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            mx: 'auto',
            minHeight: 'auto',
          }}
        >
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: 'none',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              overflow: 'hidden',
              width: '100%',
              minHeight: 'auto',
            }}
          >
            <Box 
              sx={{ 
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'transparent',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                  Your Files
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              px: 3,
              py: 2,
            }}>
              {files.length === 0 ? (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      paddingTop: '100%',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                    }}
                  >
                    <NoFilesIcon 
                      sx={{ 
                        fontSize: 48, 
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                      }} 
                    />
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      No files uploaded yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Your uploaded files will appear here
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {files.map((file, index) => (
                    <Grow
                      key={file._id}
                      in
                      timeout={300 + index * 100}
                    >
                      <Box>
                        {index > 0 && <Divider />}
                        <ListItem
                          sx={{
                            py: 3,
                            px: 2,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.03),
                            },
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                {file.originalName}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  size="small"
                                  label={formatFileSize(file.size)}
                                  sx={{ 
                                    mr: 1,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                  }}
                                />
                                <Chip
                                  size="small"
                                  icon={<FileDownloadIcon />}
                                  label={`${file.downloadCount} downloads`}
                                  sx={{ 
                                    mr: 1,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: theme.palette.success.main,
                                  }}
                                />
                                <Typography 
                                  variant="caption" 
                                  display="block" 
                                  sx={{ 
                                    mt: 1,
                                    color: 'text.secondary',
                                  }}
                                >
                                  Uploaded: {formatDate(file.uploadDate)}
                                </Typography>
                              </Box>
                            }
                          />
                          <Box sx={{ 
                            display: 'flex',
                            gap: 1,
                          }}>
                            <IconButton
                              onClick={() => handleShowQR(file)}
                              color="primary"
                              title="Show QR Code"
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            >
                              <QrCodeIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDownload(file.filename, file.originalName)}
                              color="primary"
                              title="Download file"
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteFile(file._id)}
                              color="error"
                              title="Remove from recent history"
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                      </Box>
                    </Grow>
                  ))}
                </List>
              )}
            </Box>
          </Card>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container 
        maxWidth="xl"
        sx={{ 
          py: 2,
          px: { xs: 2, sm: 3 },
          bgcolor: 'transparent',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            mx: 'auto',
            minHeight: 'auto',
          }}
        >
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              boxShadow: 'none',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              overflow: 'hidden',
              width: '100%',
              minHeight: 'auto',
            }}
          >
            <Box 
              sx={{ 
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'transparent',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                  Your Files
                </Typography>
              </Box>
            </Box>

            <Box sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              px: 3,
              py: 2,
            }}>
              {files.length === 0 ? (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      paddingTop: '100%',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                    }}
                  >
                    <NoFilesIcon 
                      sx={{ 
                        fontSize: 48, 
                        color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                      }} 
                    />
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      No files uploaded yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Your uploaded files will appear here
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <List sx={{ py: 0 }}>
                  {files.map((file, index) => (
                    <Grow
                      key={file._id}
                      in
                      timeout={300 + index * 100}
                    >
                      <Box>
                        {index > 0 && <Divider />}
                        <ListItem
                          sx={{
                            py: 3,
                            px: 2,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.03),
                            },
                            transition: 'background-color 0.2s ease',
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                {file.originalName}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  size="small"
                                  label={formatFileSize(file.size)}
                                  sx={{ 
                                    mr: 1,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                  }}
                                />
                                <Chip
                                  size="small"
                                  icon={<FileDownloadIcon />}
                                  label={`${file.downloadCount} downloads`}
                                  sx={{ 
                                    mr: 1,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: theme.palette.success.main,
                                  }}
                                />
                                <Typography 
                                  variant="caption" 
                                  display="block" 
                                  sx={{ 
                                    mt: 1,
                                    color: 'text.secondary',
                                  }}
                                >
                                  Uploaded: {formatDate(file.uploadDate)}
                                </Typography>
                              </Box>
                            }
                          />
                          <Box sx={{ 
                            display: 'flex',
                            gap: 1,
                          }}>
                            <IconButton
                              onClick={() => handleShowQR(file)}
                              color="primary"
                              title="Show QR Code"
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            >
                              <QrCodeIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDownload(file.filename, file.originalName)}
                              color="primary"
                              title="Download file"
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteFile(file._id)}
                              color="error"
                              title="Remove from recent history"
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                      </Box>
                    </Grow>
                  ))}
                </List>
              )}
            </Box>
          </Card>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Card
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{ 
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
              Your Files
            </Typography>
          </Box>
        </Box>

        {files.length === 0 ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              '&::before': {
                content: '""',
                display: 'block',
                paddingTop: '100%',
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
              }}
            >
              <NoFilesIcon 
                sx={{ 
                  fontSize: 48, 
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                }} 
              />
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                No files uploaded yet
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Your uploaded files will appear here
              </Typography>
            </Box>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {files.map((file, index) => (
              <Grow
                key={file._id}
                in
                timeout={300 + index * 100}
              >
                <Box>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      py: 3,
                      px: 2,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                      },
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                          {file.originalName}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            size="small"
                            label={formatFileSize(file.size)}
                            sx={{ 
                              mr: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          />
                          <Chip
                            size="small"
                            icon={<FileDownloadIcon />}
                            label={`${file.downloadCount} downloads`}
                            sx={{ 
                              mr: 1,
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                            }}
                          />
                          <Typography 
                            variant="caption" 
                            display="block" 
                            sx={{ 
                              mt: 1,
                              color: 'text.secondary',
                            }}
                          >
                            Uploaded: {formatDate(file.uploadDate)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ 
                      display: 'flex',
                      gap: 1,
                    }}>
                      <IconButton
                        onClick={() => handleShowQR(file)}
                        color="primary"
                        title="Show QR Code"
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <QrCodeIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDownload(file.filename, file.originalName)}
                        color="primary"
                        title="Download file"
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteFile(file._id)}
                        color="error"
                        title="Remove from recent history"
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                </Box>
              </Grow>
            ))}
          </List>
        )}
      </Card>
    </Box>
  );
};

export default RecentFiles; 