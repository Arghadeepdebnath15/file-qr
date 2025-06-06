// API Configuration
const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        // Force HTTPS in production
        return 'https://qr-file-share-5ri5.onrender.com';
    }
    // Use HTTP for local development
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
    UPLOAD: `${API_BASE_URL}/api/files/upload`,
    RECENT_FILES: `${API_BASE_URL}/api/files/recent`,
    HEALTH: `${API_BASE_URL}/api/health`,
};

// Default fetch options
export const DEFAULT_FETCH_OPTIONS = {
    mode: 'cors' as RequestMode,
    credentials: 'include' as RequestCredentials,
    headers: {
        'Accept': 'application/json',
    },
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'An unknown error occurred'
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// Helper function to make API requests
export const makeApiRequest = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const response = await fetch(endpoint, {
        ...DEFAULT_FETCH_OPTIONS,
        ...options,
        headers: {
            ...DEFAULT_FETCH_OPTIONS.headers,
            ...options.headers,
        },
    });
    return handleApiResponse(response);
}; 