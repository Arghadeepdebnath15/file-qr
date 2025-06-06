import React, { useState } from 'react';
import QRCode from 'react-qr-code';

interface PasswordProtectedQRProps {
  data: string;
  password: string;
  onScan: (password: string) => Promise<boolean>;
}

export const PasswordProtectedQR: React.FC<PasswordProtectedQRProps> = ({
  data,
  password,
  onScan
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    try {
      const isValid = await onScan(inputPassword);
      if (isValid) {
        setIsLocked(false);
        setError('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Error validating password');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg">
      {isLocked ? (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Protected QR Code</h3>
            <p className="text-sm text-gray-600">Enter password to view</p>
          </div>
          <div className="flex flex-col space-y-2">
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Enter password"
              className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleUnlock}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Unlock
            </button>
          </div>
        </div>
      ) : (
        <div>
          <QRCode value={data} />
        </div>
      )}
    </div>
  );
}; 