import React from 'react';
import { Box, Card, CardContent, Typography, alpha, Paper, Zoom, useTheme } from '@mui/material';
import QRCode from 'react-qr-code';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ScannerIcon from '@mui/icons-material/Scanner';
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
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                        radial-gradient(circle at 100% 0%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
                        radial-gradient(circle at 50% 100%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%)`,
            borderRadius: '24px',
            zIndex: 0,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #2962ff 30%, #7c4dff 90%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(124, 77, 255, 0.3)'
              : '0 4px 20px rgba(0,0,0,0.15)',
            animation: 'pulse 2s infinite',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -5,
              left: -5,
              right: -5,
              bottom: -5,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: theme.palette.mode === 'dark' ? '#768fff' : '#2962ff',
              opacity: 0.5,
              animation: 'ripple 1.5s infinite ease-out',
            },
            '@keyframes ripple': {
              '0%': {
                transform: 'scale(0.8)',
                opacity: 0.5,
              },
              '100%': {
                transform: 'scale(1.5)',
                opacity: 0,
              },
            },
          }}
        >
          <ScannerIcon sx={{ color: 'white', fontSize: 32, animation: 'scan 2s infinite' }} />
        </Box>

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
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: '25%',
                width: '50%',
                height: 3,
                background: 'inherit',
                borderRadius: '3px',
              },
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
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '10%',
                right: '10%',
                height: 2,
                background: `linear-gradient(to right, 
                  transparent, 
                  ${alpha(theme.palette.primary.main, 0.3)},
                  ${alpha(theme.palette.primary.main, 0.3)},
                  transparent
                )`,
                zIndex: 0,
              },
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
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                    }}
                  >
                    {step.label}
                  </Typography>
                </Paper>
              </React.Fragment>
            ))}
          </Box>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: 4, 
              maxWidth: 400, 
              mx: 'auto',
              lineHeight: 1.6,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -10,
                left: '10%',
                width: '80%',
                height: 1,
                background: `linear-gradient(to right, transparent, ${alpha(theme.palette.divider, 0.3)}, transparent)`,
              },
            }}
          >
            Scan this QR code with your phone to quickly upload files from your mobile device
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box 
              sx={{ 
                display: 'inline-block',
                p: 4,
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
                borderRadius: '24px',
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`
                  : '0 4px 20px rgba(0,0,0,0.05)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #768fff 30%, #b47cff 90%)'
                    : 'linear-gradient(45deg, #2962ff 30%, #7c4dff 90%)',
                  borderRadius: '26px',
                  zIndex: -1,
                  opacity: 0.5,
                  animation: 'rotate 4s linear infinite',
                },
                '@keyframes rotate': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            >
              <QRCode 
                value={uploadUrl} 
                size={256}
                level="H"
                bgColor={theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF'}
                fgColor={theme.palette.mode === 'dark' ? theme.palette.common.white : '#000000'}
              />
            </Box>

            <Typography 
              variant="body2" 
              color="primary"
              sx={{
                p: 2,
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
                display: 'inline-block',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'monospace',
                border: '1px dashed',
                borderColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.3)
                  : alpha(theme.palette.primary.main, 0.2),
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: -100,
                  width: 50,
                  height: '100%',
                  background: `linear-gradient(to right, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
                  transform: 'skewX(-45deg)',
                  animation: 'shine 3s infinite',
                },
                '@keyframes shine': {
                  '0%': {
                    left: -100,
                  },
                  '100%': {
                    left: '200%',
                  },
                },
              }}
            >
              {uploadUrl}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

export default UploadQRCode; 