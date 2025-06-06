import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import { API_URL } from '../config';
import axios from 'axios';

interface DeviceManagerProps {
  onClearHistory: () => void;
  onRefresh: () => void;
}

const DeviceManager: React.FC<DeviceManagerProps> = ({ onClearHistory, onRefresh }) => {
  const [open, setOpen] = React.useState(false);
  const [deviceFiles] = React.useState(() => {
    return JSON.parse(localStorage.getItem('deviceFiles') || '[]');
  });
  const [recentHistory] = React.useState(() => {
    return JSON.parse(localStorage.getItem('recentHistory') || '[]');
  });

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your device history? This will remove all file references from this device.')) {
      localStorage.removeItem('deviceFiles');
      onClearHistory();
      setOpen(false);
    }
  };

  const handleClearRecentHistory = async () => {
    if (window.confirm('Are you sure you want to clear your recent files history? This will only remove the history from this device.')) {
      try {
        localStorage.removeItem('recentHistory');
        // Clear recent history on the backend for this device
        const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
        await axios.post(`${API_URL}/api/files/clear-recent-history`, { deviceId });
        onRefresh();
      } catch (error) {
        console.error('Error clearing recent history:', error);
        alert('Failed to clear recent history. Please try again.');
      }
    }
  };

  const generateDeviceId = () => {
    const deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
    return deviceId;
  };

  return (
    <>
      <Tooltip title="Device Settings">
        <IconButton 
          onClick={() => setOpen(true)}
          sx={{ 
            position: 'absolute',
            right: 16,
            top: 16,
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Device Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Device Statistics
            </Typography>
            <Typography variant="body1">
              Files tracked on this device: {deviceFiles.length}
            </Typography>
            <Typography variant="body1">
              Recent files history: {recentHistory.length} files
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Device Management
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearHistory}
                fullWidth
              >
                Clear Device History
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<HistoryIcon />}
                onClick={handleClearRecentHistory}
                fullWidth
              >
                Clear Recent Files History
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeviceManager; 