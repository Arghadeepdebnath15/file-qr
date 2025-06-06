import React from 'react';
import { Box, Card, CardContent, Typography, alpha, Paper, Zoom } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import QRCode from 'react-qr-code';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_URL } from '../config';

const UploadQRCode: React.FC = () => {
  const theme = useTheme();
  
  // Get the base URL for the upload page
  const uploadUrl = `${API_URL}/api/files/upload-page`;

  return (
    <Zoom in={true}>
      <Card 
        sx={{ 
          mt: 4, 
          mb: 4,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          overflow: 'visible',
          position: 'relative',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.palette.mode === 'dark'
              ? `0 8px 30px ${alpha(theme.palette.primary.main, 0.2)}`
              : '0 8px 30px rgba(41, 98, 255, 0.1)',
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center', pt: 5, position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #768fff 30%, #b47cff 90%)'
                : 'linear-gradient(45deg, #2962ff 30%, #7c4dff 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Quick Upload QR Code
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 4,
              gap: 1,
            }}
          >
            {[
              { icon: <PhoneIphoneIcon />, label: 'Scan' },
              { icon: <CloudUploadIcon />, label: 'Upload' },
              { icon: <ArrowUpwardIcon />, label: 'Done' }
            ].map((step, index) => (
              <React.Fragment key={step.label}>
                {index > 0 && (
                  <Box 
                    sx={{ 
                      height: 2, 
                      width: 40, 
                      bgcolor: 'primary.main',
                      opacity: theme.palette.mode === 'dark' ? 0.4 : 0.3,
                    }} 
                  />
                )}
                <Paper
                  elevation={0}
                  sx={{
                    textAlign: 'center',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.1),
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box 
                    sx={{ 
                      color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
                      mb: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {step.label}
                  </Typography>
                </Paper>
              </React.Fragment>
            ))}
          </Box>

          <Box sx={{ mb: 4 }}>
            <QRCode
              value={uploadUrl}
              size={200}
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                padding: '1rem',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            Scan this QR code to quickly access the upload page
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );
};

export default UploadQRCode; 