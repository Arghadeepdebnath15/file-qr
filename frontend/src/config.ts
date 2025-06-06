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

  // In production, use the same origin as the frontend
  // This ensures the API calls go to the same domain
  return window.location.origin;
};

export const API_URL = getApiUrl();

// Export additional configuration
export const CONFIG = {
  POLL_INTERVAL: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
  MIN_RETRY_DELAY: 1000, // 1 second minimum between retries
  MAX_RETRY_DELAY: 5000, // 5 seconds maximum between retries
}; 