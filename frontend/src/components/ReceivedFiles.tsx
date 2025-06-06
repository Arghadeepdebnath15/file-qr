import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Use refs for values that shouldn't trigger re-renders
  const retryCountRef = useRef(0);
  const lastFetchTimeRef = useRef(0);
  const isMountedRef = useRef(true);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const calculateRetryDelay = (retry: number) => {
    // Exponential backoff with jitter
    const baseDelay = Math.min(
      CONFIG.MAX_RETRY_DELAY,
      Math.max(CONFIG.MIN_RETRY_DELAY, CONFIG.RETRY_DELAY * Math.pow(2, retry))
    );
    // Add random jitter of up to 1 second
    return baseDelay + Math.random() * 1000;
  };

  const fetchFiles = useCallback(async (isRetry = false) => {
    // Skip if component is unmounted
    if (!isMountedRef.current) return;

    try {
      // If this is not a retry, check if we need to wait
      if (!isRetry) {
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTimeRef.current;
        if (timeSinceLastFetch < CONFIG.POLL_INTERVAL) {
          // Skip this fetch if it's too soon
          return;
        }
      }

      setLoading(true);
      setError(null);
      
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
      retryCountRef.current = 0;
      lastFetchTimeRef.current = Date.now();
      
      // Mark files as new if they were uploaded in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const processedFiles = data.map((file: FileInfo) => ({
        ...file,
        isNew: new Date(file.uploadDate) > fiveMinutesAgo
      }));
      
      if (isMountedRef.current) {
        setFiles(processedFiles);
        setNewFilesCount(processedFiles.filter((f: FileInfo) => f.isNew).length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Error: ${err.message}`
        : 'An unknown error occurred';
      
      if (isMountedRef.current) {
        setError(errorMessage);
      }
      console.error('Error fetching files:', err);

      // Implement retry logic with exponential backoff
      if (retryCountRef.current < CONFIG.MAX_RETRIES) {
        retryCountRef.current += 1;
        const delay = calculateRetryDelay(retryCountRef.current);
        await sleep(delay);
        if (isMountedRef.current) {
          await fetchFiles(true); // Mark this as a retry attempt
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // Empty dependency array since we're using refs

  // Setup polling with cleanup
  useEffect(() => {
    const startPolling = async () => {
      isMountedRef.current = true;
      await fetchFiles(); // Initial fetch
      
      // Set up polling interval
      const intervalId = setInterval(async () => {
        if (isMountedRef.current) {
          await fetchFiles();
        }
      }, CONFIG.POLL_INTERVAL);

      // Cleanup function
      return () => {
        isMountedRef.current = false;
        clearInterval(intervalId);
      };
    };

    // Start polling and store cleanup function
    const cleanup = startPolling();
    return () => {
      cleanup.then(cleanupFn => cleanupFn());
    };
  }, [fetchFiles]); // Include fetchFiles in dependencies

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
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      setFiles(files.map(file => ({ ...file, isNew: false })));
      setNewFilesCount(0);
    } catch (err) {
      console.error('Error marking files as read:', err);
    }
  };

  const renderContent = () => {
    if (loading && files.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      );
    }

    if (error && files.length === 0) {
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
            {index > 0 && <Divider />}
            <ListItem
              sx={{
                bgcolor: file.isNew ? alpha(theme.palette.info.main, 0.1) : 'transparent',
                '&:hover': {
                  bgcolor: file.isNew 
                    ? alpha(theme.palette.info.main, 0.2)
                    : alpha(theme.palette.action.hover, 0.1)
                }
              }}
            >
              <FolderIcon sx={{ mr: 2, color: 'primary.main' }} />
              <ListItemText
                primary={file.originalName}
                secondary={`${formatFileSize(file.size)} • Uploaded ${formatDate(file.uploadDate)}`}
              />
              {file.isNew && (
                <Badge color="info" variant="dot" sx={{ ml: 2 }} />
              )}
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Card>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="h2">
          Received Files
        </Typography>
        {newFilesCount > 0 && (
          <IconButton onClick={markAllAsRead} color="primary" title="Mark all as read">
            <DoneAllIcon />
          </IconButton>
        )}
      </Box>
      {renderContent()}
    </Card>
  );
};

export default ReceivedFiles; 