import React, { useState, useEffect } from 'react';
import { QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const NetworkInfo: React.FC = () => {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Get the current hostname/IP
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    
    // If running locally, try to get the local IP
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Try to get the local IP address
      fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
          setIpAddress(`${protocol}//${data.ip}:${port}`);
        })
        .catch(() => {
          // Fallback to localhost if can't get IP
          setIpAddress(`${protocol}//${hostname}:${port}`);
        });
    } else {
      setIpAddress(`${protocol}//${hostname}:${port}`);
    }
  }, []);

  return (
    <>
      <button
        onClick={() => setShowQR(true)}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Show QR Code"
      >
        <QrCode className="w-5 h-5" />
      </button>

      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1"></div>
              <h3 className="text-sm font-semibold text-gray-900 text-center flex-1 max-w-[180px] whitespace-nowrap">Daily Meeting Manager Access</h3>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-500 hover:text-gray-700 flex-1 flex justify-end"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-sm text-gray-600 text-center space-y-2">
                <p className="font-medium">Before scanning:</p>
                <p>1. Make sure you are connected to OCP-internet</p>
                <p>2. Then scan the QR code below</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <QRCodeSVG
                  value={ipAddress}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NetworkInfo; 