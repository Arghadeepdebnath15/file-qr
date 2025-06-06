import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grow,
  Badge,
  IconButton,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import NoFilesIcon from '@mui/icons-material/FileCopy';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useTheme } from '@mui/material/styles';
import { API_URL } from '../config';

interface FileInfo {
  _id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadDate: string;
  url: string;
  isNew?: boolean;
}

const ReceivedFiles: React.FC = () => {
  const theme = useTheme();
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFilesCount, setNewFilesCount] = useState(0);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/files/recent`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      
      // Mark files as new if they were uploaded in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const processedFiles = data.map((file: FileInfo) => ({
        ...file,
        isNew: new Date(file.uploadDate) > fiveMinutesAgo
      }));
      
      setFiles(processedFiles);
      setNewFilesCount(processedFiles.filter((f: FileInfo) => f.isNew).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // Poll for new files every 5 seconds for more responsive updates
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/files/mark-all-read`, {
        method: 'POST'
      });
      setFiles(files.map(file => ({ ...file, isNew: false })));
      setNewFilesCount(0);
    } catch (err) {
      console.error('Error marking files as read:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Card
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            overflow: 'hidden',
            maxHeight: '80vh',
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
              position: 'sticky',
              top: 0,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              zIndex: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Badge badgeContent={newFilesCount} color="primary">
                <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                Received Files
              </Typography>
            </Box>
            {newFilesCount > 0 && (
              <IconButton onClick={markAllAsRead} size="small" color="primary">
                <DoneAllIcon />
              </IconButton>
            )}
          </Box>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        </Card>
      </Box>
    );
  }

  if (error) {
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
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
        </Card>
      </Box>
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
          maxHeight: '80vh',
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
            position: 'sticky',
            top: 0,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge badgeContent={newFilesCount} color="primary">
              <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
            </Badge>
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
              Received Files
            </Typography>
          </Box>
          {newFilesCount > 0 && (
            <IconButton onClick={markAllAsRead} size="small" color="primary" title="Mark all as read">
              <DoneAllIcon />
            </IconButton>
          )}
        </Box>

        <Box
          sx={{
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              width: '8px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.3)' 
                  : 'rgba(0, 0, 0, 0.3)',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.2) transparent'
              : 'rgba(0, 0, 0, 0.2) transparent',
          }}
        >
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
                  No files received yet
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Uploaded files will appear here
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
                        py: 2,
                        px: { xs: 2, sm: 3 },
                        transition: 'all 0.2s ease',
                        bgcolor: file.isNew ? (theme.palette.mode === 'dark' 
                          ? 'rgba(25, 118, 210, 0.08)'
                          : 'rgba(25, 118, 210, 0.05)'
                        ) : 'transparent',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography component="div" variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 500, mb: 1 }}>
                            {file.originalName}
                            {file.isNew && (
                              <Badge
                                color="primary"
                                variant="dot"
                                sx={{ 
                                  '& .MuiBadge-badge': {
                                    animation: 'pulse 2s infinite',
                                  }
                                }}
                              />
                            )}
                          </Typography>
                        }
                        secondary={
                          <Typography component="div" variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                            Received: {formatDate(file.uploadDate)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </Box>
                </Grow>
              ))}
            </List>
          )}
        </Box>
      </Card>

      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(.75);
            }
            20% {
              transform: scale(1);
            }
            40% {
              transform: scale(.75);
            }
            60% {
              transform: scale(1);
            }
            80% {
              transform: scale(.75);
            }
            100% {
              transform: scale(.75);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ReceivedFiles; 