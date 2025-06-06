// API Configuration
const getApiUrl = () => {
  // Check if we're running on localhost or local network
  const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.hostname.startsWith('192.168.');

  // If we're on local network, use the same hostname but with port 5000
  if (isLocal) {
    return `http://${window.location.hostname}:5000`;
  }

  // In production, use the production URL
  return 'https://qr-file-share-5ri5.onrender.com';
};

export const API_URL = getApiUrl(); 