import React, { useState } from 'react';
import QRCode from 'react-qr-code';

interface CustomDomainQRProps {
  originalUrl: string;
  customDomain?: string;
  onDomainChange: (domain: string) => Promise<boolean>;
}

export const CustomDomainQR: React.FC<CustomDomainQRProps> = ({
  originalUrl,
  customDomain,
  onDomainChange
}) => {
  const [domain, setDomain] = useState(customDomain || '');
  const [isEditing, setIsEditing] = useState(!customDomain);
  const [error, setError] = useState('');

  const handleDomainUpdate = async () => {
    try {
      const isValid = await onDomainChange(domain);
      if (isValid) {
        setIsEditing(false);
        setError('');
      } else {
        setError('Invalid domain');
      }
    } catch (err) {
      setError('Error validating domain');
    }
  };

  const getQRUrl = () => {
    if (!domain) return originalUrl;
    try {
      const url = new URL(originalUrl);
      return `https://${domain}${url.pathname}${url.search}`;
    } catch {
      return originalUrl;
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Domain QR Code</h3>
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter your domain (e.g., qr.yourdomain.com)"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex space-x-2">
              <button
                onClick={handleDomainUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Save Domain
              </button>
              {customDomain && (
                <button
                  onClick={() => {
                    setDomain(customDomain);
                    setIsEditing(false);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Using domain: <span className="font-medium">{domain}</span>
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Change Domain
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <QRCode value={getQRUrl()} />
      </div>
    </div>
  );
}; 