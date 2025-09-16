import React from 'react';
import { X } from 'lucide-react';
import api from '../api/http';

interface PdfViewerOverlayProps {
  fileName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const PdfViewerOverlay: React.FC<PdfViewerOverlayProps> = ({ fileName, isOpen, onClose }) => {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let url: string | null = null;
    async function load() {
      if (!fileName || !isOpen) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/reports/${encodeURIComponent(fileName)}`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load PDF');
      } finally {
        setIsLoading(false);
      }
    }
    load();
    return () => {
      if (url) URL.revokeObjectURL(url);
      setPdfUrl(null);
    };
  }, [fileName, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm">
      <div className="absolute top-3 right-3">
        <button onClick={onClose} className="text-white hover:text-gray-200 p-2 rounded">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
        {isLoading && (
          <div className="text-white text-sm">Loading PDF...</div>
        )}
        {error && (
          <div className="text-red-300 text-sm bg-red-900/30 p-3 rounded">{error}</div>
        )}
        {!isLoading && !error && pdfUrl && (
          <iframe
            title={fileName || 'Report'}
            src={pdfUrl}
            className="w-full h-full rounded border border-gray-700 bg-white"
          />
        )}
      </div>
    </div>
  );
};

export default PdfViewerOverlay; 