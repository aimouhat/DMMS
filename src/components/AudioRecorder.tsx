import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCw } from 'lucide-react';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  serverUrl?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onTranscriptionComplete,
  serverUrl = 'http://172.23.5.34:8000'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSummaryRef = useRef<string>('');

  // Function to check server availability
  const checkServerAvailability = async () => {
    try {
      const response = await fetch(`${serverUrl}`, {
        method: 'GET'
      });
      const data = await response.json();
      return data.message === "LAVEX Safety Contact API";
    } catch (error) {
      console.error('Server check failed:', error);
      return false;
    }
  };

  // Check server availability on component mount
  useEffect(() => {
    checkServerAvailability().then(isAvailable => {
      if (!isAvailable) {
        setError('Unable to connect to the recording server. Please check if the server is running and accessible.');
      }
    });

    // Cleanup polling on unmount
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [serverUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      
      const response = await fetch(`${serverUrl}/start`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "Recording started") {
        setIsRecording(true);
      } else {
        throw new Error('Failed to start recording');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(`Failed to start recording: ${errorMessage}`);
      console.error('Error starting recording:', err);
    }
  };

  const pollForSummary = async (): Promise<string> => {
    try {
      const response = await fetch(`${serverUrl}/summary`, {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary && data.summary !== lastSummaryRef.current) {
          lastSummaryRef.current = data.summary;
          return data.summary;
        }
      }

      // If no new summary, wait and try again
      return new Promise((resolve) => {
        pollingTimeoutRef.current = setTimeout(() => {
          resolve(pollForSummary());
        }, 1000); // Poll every second
      });
    } catch (error) {
      // If there's an error, wait and try again
      return new Promise((resolve) => {
        pollingTimeoutRef.current = setTimeout(() => {
          resolve(pollForSummary());
        }, 1000);
      });
    }
  };

  const stopRecording = async () => {
    if (isRecording) {
      try {
        setIsRecording(false);
        setIsGenerating(true);
        setError(null);

        // Stop recording
        const stopResponse = await fetch(`${serverUrl}/stop`, {
          method: 'GET'
        });

        if (!stopResponse.ok) {
          const errorData = await stopResponse.json();
          throw new Error(errorData.error || `Failed to stop recording: ${stopResponse.status}`);
        }

        // Start polling for summary
        const summary = await pollForSummary();
        onTranscriptionComplete(summary);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process recording';
        setError(`Error in recording process: ${errorMessage}`);
        console.error('Error in recording process:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-300"
            disabled={isGenerating}
          >
            <Mic className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-all duration-300"
          >
            <Square className="w-6 h-6" />
          </button>
        )}
      </div>

      {isRecording && (
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-100"
            style={{ width: `${(audioLevel / 255) * 100}%` }}
          />
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center space-x-2 text-gray-600">
          <RotateCw className="w-5 h-5 animate-spin" />
          <span>Processing recording...</span>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;