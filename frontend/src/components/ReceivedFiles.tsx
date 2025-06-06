import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  IconButton,
  alpha,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import NoFilesIcon from '@mui/icons-material/FileCopy';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useTheme } from '@mui/material/styles';
import { API_URL, CONFIG } from '../config';

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
  const [retryCount, setRetryCount] = useState(0);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchFiles = useCallback(async () => {
    try {
      if (!loading) setLoading(true);
      setError(null);
      
      console.log('Fetching files from:', `${API_URL}/api/files/recent`);
      
      const response = await fetch(`${API_URL}/api/files/recent`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array');
      }
      
      // Reset retry count on successful fetch
      setRetryCount(0);
      
      // Mark files as new if they were uploaded in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const processedFiles = data.map((file: FileInfo) => ({
        ...file,
        isNew: new Date(file.uploadDate) > fiveMinutesAgo
      }));
      
      setFiles(processedFiles);
      setNewFilesCount(processedFiles.filter((f: FileInfo) => f.isNew).length);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Error: ${err.message}`
        : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching files:', err);

      // Implement retry logic
      if (retryCount < CONFIG.MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        await sleep(CONFIG.RETRY_DELAY);
        await fetchFiles();
      }
    } finally {
      setLoading(false);
    }
  }, [loading, retryCount]);

  useEffect(() => {
    fetchFiles();
    // Poll for new files
    const interval = setInterval(fetchFiles, CONFIG.POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchFiles]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      );
    }

    if (files.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <NoFilesIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No files received yet
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        {files.map((file, index) => (
          <React.Fragment key={file._id}>
            <ListItem
              sx={{
                py: 2,
                bgcolor: file.isNew
                  ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.05)
                  : 'transparent',
                transition: 'background-color 0.3s ease',
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {file.originalName}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" component="span" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      Size: {formatFileSize(file.size)}
                    </Typography>
                    <Typography variant="body2" component="span" color="text.secondary" display="block">
                      Uploaded: {formatDate(file.uploadDate)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < files.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.6)
            : alpha(theme.palette.background.paper, 0.8),
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
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.8)
              : theme.palette.background.paper,
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
        {renderContent()}
      </Card>
    </Box>
  );
};

export default ReceivedFiles; 