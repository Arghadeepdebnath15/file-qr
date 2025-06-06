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
      <Container maxWidth={false} sx={{ 
        height: '100vh',
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: alpha(theme.palette.primary.main, 0.03),
      }}>
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <DeviceManager onClearHistory={handleClearAll} onRefresh={fetchRecentFiles} />
          </Box>

          <Card 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: theme.shadows[3],
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box 
                sx={{ 
                  p: 3,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Your Files
                  </Typography>
                </Box>
                {files.length > 0 && (
                  <Fade in>
                    <Button
                      variant="outlined"
                      color="error"
                      size="medium"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearAll}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                      }}
                    >
                      Clear All
                    </Button>
                  </Fade>
                )}
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
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      py: 8,
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                    <Typography variant="h6" color="text.secondary">
                      No files uploaded from this device yet
                    </Typography>
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
        </CardContent>
      </Card>

          <Dialog 
            open={showQRDialog} 
            onClose={() => setShowQRDialog(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                p: 2,
              },
            }}
          >
            <DialogTitle sx={{ 
              textAlign: 'center',
              fontWeight: 600,
              pb: 3,
            }}>
              Scan QR Code to Download
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
              {selectedFile && (
                <Fade in timeout={500}>
                  <Box sx={{ 
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <Paper
                      elevation={4}
                      sx={{ 
                        p: 4,
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <QRCode 
                        value={`${API_URL}/api/files/download/${selectedFile.filename}`}
                        size={256}
                      />
                    </Paper>
                    <Typography variant="body1" color="text.secondary">
                      Scan this QR code to download <strong>{selectedFile.originalName}</strong>
                    </Typography>
                  </Box>
                </Fade>
              )}
            </DialogContent>
          </Dialog>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={false} sx={{ 
        height: '100vh',
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: alpha(theme.palette.primary.main, 0.03),
      }}>
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <DeviceManager onClearHistory={handleClearAll} onRefresh={fetchRecentFiles} />
          </Box>

          <Card 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: theme.shadows[3],
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box 
                sx={{ 
                  p: 3,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Your Files
                  </Typography>
                </Box>
                {files.length > 0 && (
                  <Fade in>
                    <Button
                      variant="outlined"
                      color="error"
                      size="medium"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearAll}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                      }}
                    >
                      Clear All
                    </Button>
                  </Fade>
                )}
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
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      py: 8,
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                    <Typography variant="h6" color="text.secondary">
                      No files uploaded from this device yet
                    </Typography>
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
        </CardContent>
      </Card>

          <Dialog 
            open={showQRDialog} 
            onClose={() => setShowQRDialog(false)} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                p: 2,
              },
            }}
          >
            <DialogTitle sx={{ 
              textAlign: 'center',
              fontWeight: 600,
              pb: 3,
            }}>
              Scan QR Code to Download
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
              {selectedFile && (
                <Fade in timeout={500}>
                  <Box sx={{ 
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <Paper
                      elevation={4}
                      sx={{ 
                        p: 4,
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <QRCode 
                        value={`${API_URL}/api/files/download/${selectedFile.filename}`}
                        size={256}
                      />
                    </Paper>
                    <Typography variant="body1" color="text.secondary">
                      Scan this QR code to download <strong>{selectedFile.originalName}</strong>
                    </Typography>
                  </Box>
                </Fade>
              )}
            </DialogContent>
          </Dialog>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ 
      height: '100vh',
      py: 4,
      px: { xs: 2, sm: 3, md: 4 },
      bgcolor: alpha(theme.palette.primary.main, 0.03),
    }}>
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          bgcolor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <DeviceManager onClearHistory={handleClearAll} onRefresh={fetchRecentFiles} />
        </Box>

        <Card 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: theme.shadows[3],
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box 
              sx={{ 
                p: 3,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Your Files
          </Typography>
              </Box>
              {files.length > 0 && (
                <Fade in>
                  <Button
                    variant="outlined"
                    color="error"
                    size="medium"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearAll}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                    }}
                  >
                    Clear All
                  </Button>
                </Fade>
              )}
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
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    py: 8,
                  }}
                >
                  <FolderIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
                  <Typography variant="h6" color="text.secondary">
                    No files uploaded from this device yet
                  </Typography>
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
        </CardContent>
      </Card>

        <Dialog 
          open={showQRDialog} 
          onClose={() => setShowQRDialog(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 2,
            },
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            fontWeight: 600,
            pb: 3,
          }}>
            Scan QR Code to Download
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 4 }}>
          {selectedFile && (
              <Fade in timeout={500}>
                <Box sx={{ 
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <Paper
                    elevation={4}
                    sx={{ 
                      p: 4,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                    }}
                  >
              <QRCode 
                      value={`${API_URL}/api/files/download/${selectedFile.filename}`}
                size={256} 
              />
                  </Paper>
                  <Typography variant="body1" color="text.secondary">
                    Scan this QR code to download <strong>{selectedFile.originalName}</strong>
              </Typography>
            </Box>
              </Fade>
          )}
        </DialogContent>
      </Dialog>
      </Paper>
    </Container>
  );
};

export default RecentFiles; 