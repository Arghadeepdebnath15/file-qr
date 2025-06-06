import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  alpha,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Code as CodeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface FilePreviewProps {
  file: File | null;
  open: boolean;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, open, onClose }) => {
  if (!file) return null;

  const getFileType = () => {
    const type = file.type.split('/')[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (type === 'image') return 'image';
    if (type === 'video') return 'video';
    if (type === 'audio') return 'audio';
    if (type === 'application' && file.type.includes('pdf')) return 'pdf';
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp'].includes(extension || '')) return 'code';
    return 'document';
  };

  const renderPreview = () => {
    const fileType = getFileType();
    const url = URL.createObjectURL(file);

    switch (fileType) {
      case 'image':
        return (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <img 
              src={url} 
              alt={file.name}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '60vh',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            />
          </Box>
        );
      case 'video':
        return (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <video 
              controls 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '60vh',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <source src={url} type={file.type} />
              Your browser does not support the video tag.
            </video>
          </Box>
        );
      case 'audio':
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <AudioIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <audio controls style={{ width: '100%' }}>
              <source src={url} type={file.type} />
              Your browser does not support the audio tag.
            </audio>
          </Box>
        );
      case 'pdf':
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <iframe
              src={url}
              title="PDF Preview"
              style={{
                width: '100%',
                height: '60vh',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        );
      case 'code':
        return (
          <Box sx={{ p: 4 }}>
            <Box 
              sx={{ 
                bgcolor: '#1e1e1e',
                p: 3,
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '60vh'
              }}
            >
              <CodeIcon sx={{ color: '#fff', mb: 2 }} />
              <Typography sx={{ color: '#fff', fontFamily: 'monospace' }}>
                Code preview available after upload
              </Typography>
            </Box>
          </Box>
        );
      default:
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <DocumentIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Preview not available for this file type
            </Typography>
          </Box>
        );
    }
  };

  const getFileIcon = () => {
    const fileType = getFileType();
    switch (fileType) {
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'audio': return <AudioIcon />;
      case 'pdf': return <PdfIcon />;
      case 'code': return <CodeIcon />;
      default: return <DocumentIcon />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          bgcolor: alpha('#2962ff', 0.05),
          borderBottom: '1px solid',
          borderColor: alpha('#000', 0.1)
        }}
      >
        {getFileIcon()}
        <Typography sx={{ flex: 1, fontWeight: 500 }}>{file.name}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {renderPreview()}
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview; 