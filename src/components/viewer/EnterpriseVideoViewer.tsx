/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Video Viewer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Media Preview, Document Viewer & Attachment Dialog System
 * Version: 1.0
 */

import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Video,
  Download,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { FileMetadata } from '../../types/fileManagementFramework';
import { ViewerPermissions } from '../../types/mediaViewerFramework';

export interface EnterpriseVideoViewerProps {
  file: FileMetadata;
  videoUrl?: string;
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onDownload?: () => void;
}

export const EnterpriseVideoViewer: React.FC<EnterpriseVideoViewerProps> = ({
  file,
  videoUrl,
  permissions = { canDownload: true },
  isAr = false,
  onDownload,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hasError, setHasError] = useState<boolean>(false);

  const activeUrl = videoUrl || file.previewUrl || file.url;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handlePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Video Canvas Container */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {hasError ? (
          <div className="p-6 text-center max-w-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <span className="text-sm font-bold text-white">
              {isAr ? 'تعذر تشغيل الفيديو' : 'Video Playback Error'}
            </span>
            <span className="text-xs text-slate-400">
              {isAr ? 'تأكد من دعم الصيغة أو قم بتنزيل الملف.' : 'Format unplayable in browser.'}
            </span>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={activeUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
            className="max-h-full max-w-full object-contain"
            onClick={togglePlay}
          />
        )}
      </div>

      {/* Control Overlay Bar */}
      <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-2">
        {/* Seek Trackbar */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors shadow"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <span className="font-mono text-[11px] text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 ml-2">
              <button type="button" onClick={toggleMute} className="text-slate-400 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-800 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed selection */}
            {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handlePlaybackRate(rate)}
                className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded ${
                  playbackRate === rate
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {permissions.canDownload && onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="p-1.5 hover:bg-slate-800 text-amber-400 hover:text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
