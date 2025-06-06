import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import DevicesIcon from '@mui/icons-material/Devices';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HistoryIcon from '@mui/icons-material/History';
import ShareIcon from '@mui/icons-material/Share';
import PhonelinkIcon from '@mui/icons-material/Phonelink';

const Blog: React.FC = () => {
  const theme = useTheme();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'QrCode':
        return <QrCodeIcon sx={{ fontSize: 40 }} />;
      case 'Security':
        return <SecurityIcon sx={{ fontSize: 40 }} />;
      case 'Speed':
        return <SpeedIcon sx={{ fontSize: 40 }} />;
      case 'Devices':
        return <DevicesIcon sx={{ fontSize: 40 }} />;
      case 'CloudUpload':
        return <CloudUploadIcon />;
      case 'History':
        return <HistoryIcon />;
      case 'Share':
        return <ShareIcon />;
      case 'Phonelink':
        return <PhonelinkIcon />;
      default:
        return null;
    }
  };

  const features = [
    {
      iconName: 'QrCode',
      title: 'Instant QR Code Generation',
      description: 'Generate QR codes instantly for your files, making sharing as simple as scanning.',
      color: theme.palette.primary.main,
    },
    {
      iconName: 'Security',
      title: 'Secure File Transfer',
      description: 'Your files are transferred securely with end-to-end encryption and temporary storage.',
      color: theme.palette.success.main,
    },
    {
      iconName: 'Speed',
      title: 'Lightning Fast',
      description: 'Experience rapid file transfers with optimized upload and download speeds.',
      color: theme.palette.warning.main,
    },
    {
      iconName: 'Devices',
      title: 'Cross-Device Compatibility',
      description: 'Share files seamlessly between any devices - phones, tablets, or computers.',
      color: theme.palette.info.main,
    },
  ];

  const benefits = [
    {
      title: 'No App Installation Required',
      description: 'Access and share files directly through your web browser without installing any additional software.',
      iconName: 'Phonelink',
    },
    {
      title: 'Track File History',
      description: 'Keep track of your shared files with a comprehensive history of uploads and downloads.',
      iconName: 'History',
    },
    {
      title: 'Easy File Management',
      description: 'Manage your uploaded files with an intuitive interface and organize them efficiently.',
      iconName: 'CloudUpload',
    },
    {
      title: 'Instant Sharing',
      description: 'Share files instantly by showing the QR code to recipients or sending the direct download link.',
      iconName: 'Share',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography
              variant="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              QR Share
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              The Future of File Sharing is Here
            </Typography>
            <Box
              component="img"
              src="/images/hero-image.svg"
              alt="QR Share Hero"
              sx={{
                width: '100%',
                maxWidth: 600,
                height: 'auto',
                borderRadius: 4,
                boxShadow: theme.shadows[4],
              }}
            />
          </Paper>

          {/* Features Section */}
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
              Key Features
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: 'repeat(4, 1fr)',
                },
                gap: 4,
              }}
            >
              {features.map((feature, index) => (
                <Fade key={index} in timeout={500 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 4,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          mb: 2,
                          display: 'inline-flex',
                          p: 2,
                          borderRadius: '50%',
                          bgcolor: alpha(feature.color, 0.1),
                          color: feature.color,
                        }}
                      >
                        {getIcon(feature.iconName)}
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Box>
          </Box>

          {/* How It Works Section */}
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
              How It Works
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src="/images/how-it-works.svg"
                alt="How QR Share Works"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                }}
              />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        p: 1,
                        borderRadius: '50%',
                      }}
                    >
                      1
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary="Upload Your File"
                    secondary="Simply drag and drop or select your file to upload"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        p: 1,
                        borderRadius: '50%',
                      }}
                    >
                      2
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary="Get QR Code"
                    secondary="A unique QR code is generated for your file"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Box
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        p: 1,
                        borderRadius: '50%',
                      }}
                    >
                      3
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary="Share & Download"
                    secondary="Recipients can scan the QR code to instantly download the file"
                  />
                </ListItem>
              </List>
            </Box>
          </Paper>

          {/* Benefits Section */}
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
              Benefits of QR Share
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 4,
              }}
            >
              {benefits.map((benefit, index) => (
                <Fade key={index} in timeout={500 + index * 200}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {getIcon(benefit.iconName)}
                      </Box>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {benefit.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Blog; 