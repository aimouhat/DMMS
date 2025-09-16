import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, Move } from 'lucide-react';

const FloatingVideoPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.drag-handle')) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setError('Failed to play video. Please check if the video file exists.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    setError('Video file not found. Please add a video file named "4.mp4" to the public/videos directory.');
  };

  // Don't render on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <div
      ref={playerRef}
      className="fixed z-50 transition-all duration-300 ease-in-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isMinimized ? 'scale(0.5)' : 'scale(1)',
        opacity: isMinimized ? 0.7 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-blue-500/30 backdrop-blur-sm">
        {/* Drag handle */}
        <div className="drag-handle absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-blue-600/50 to-purple-600/50 cursor-move flex items-center justify-between px-3">
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-blue-200">Time Manager</span>
          </div>
          <button
            onClick={toggleMinimize}
            className="text-blue-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video container */}
        <div className="mt-6">
          {error ? (
            <div className="w-[240px] h-[135px] flex items-center justify-center bg-gray-800 rounded-b-lg">
              <p className="text-red-400 text-xs p-4 text-center">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src="/videos/4.mp4"
                className="w-[240px] h-[135px] rounded-b-lg"
                controls={false}
                onError={handleVideoError}
                loop
              />
              
              {/* Controls */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 rounded-full px-2 py-0.5">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default FloatingVideoPlayer;