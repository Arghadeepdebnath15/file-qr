// Use localhost in development, remote URL in production
export const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000'
  : 'https://qr-file-share-5ri5.onrender.com'; 