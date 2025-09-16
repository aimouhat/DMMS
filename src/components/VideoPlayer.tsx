import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface VideoPlayerProps {
  folderPath: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ folderPath }) => {
  const [currentVideo, setCurrentVideo] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [videos, setVideos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Get list of videos from the folder
    const videoList = [
      '/videos/1.mp4',
      '/videos/2.mp4',
      '/videos/3.mp4',
      '/videos/4.mp4'
    ];
    setVideos(videoList);
    setCurrentVideo(videoList[0]);
  }, [folderPath]);

  const playNextVideo = () => {
    const nextIndex = (currentIndex + 1) % videos.length;
    setCurrentIndex(nextIndex);
    setCurrentVideo(videos[nextIndex]);
    setIsPlaying(true);
  };

  const playPreviousVideo = () => {
    const prevIndex = (currentIndex - 1 + videos.length) % videos.length;
    setCurrentIndex(prevIndex);
    setCurrentVideo(videos[prevIndex]);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    setIsPlaying(!isPlaying);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      className="relative group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="aspect-w-16 aspect-h-9">
        <video
          ref={videoRef}
          src={currentVideo}
          className="w-full h-[200px] rounded-lg"
          controls={false}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={playNextVideo}
        />
      </div>
      
      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        } group-hover:opacity-100`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center space-x-4">
        <button
          onClick={playPreviousVideo}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
        >
              <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={togglePlay}
              className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300"
        >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
        <button
          onClick={playNextVideo}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300"
        >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Video Info */}
        <div className="absolute bottom-4 left-4 text-white text-sm">
          Video {currentIndex + 1} of {videos.length}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={handleFullscreen}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;