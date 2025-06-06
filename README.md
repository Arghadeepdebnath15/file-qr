# QR File Share

MERN application for sharing files via QR codes

## Features

- Generate QR codes for any text or URL
- Access generated QR codes from any device
- Real-time QR code generation
- Responsive design
- Cloud-hosted solution

## Tech Stack

- Frontend:
  - React.js
  - Tailwind CSS
  - qrcode.react for QR generation
  
- Backend:
  - Node.js
  - Express.js
  - CORS enabled for cross-origin requests

## Deployment Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Local Development
1. Clone the repository:
```bash
git clone <your-repo-url>
cd qr-file-share
```

2. Install dependencies:
```bash
npm run install-all
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

4. Run the development server:
```bash
npm run dev
```

### Deployment

#### Netlify (Frontend)
1. Connect your GitHub repository to Netlify
2. Use the following build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
3. Add environment variables in Netlify dashboard

#### Render (Backend)
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables in Render dashboard

#### Environment Variables Required
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT authentication
- `NODE_ENV`: Set to 'production' in deployment

## License
ISC 