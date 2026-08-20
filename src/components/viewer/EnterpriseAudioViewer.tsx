/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Audio Viewer Component
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
  Music,
  Download,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { FileMetadata } from '../../types/fileManagementFramework';
import { ViewerPermissions } from '../../types/mediaViewerFramework';

export interface EnterpriseAudioViewerProps {
  file: FileMetadata;
  audioUrl?: string;
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onDownload?: () => void;
}

export const EnterpriseAudioViewer: React.FC<EnterpriseAudioViewerProps> = ({
  file,
  audioUrl,
  permissions = { canDownload: true },
  isAr = false,
  onDownload,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const activeUrl = audioUrl || file.previewUrl || file.url;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full h-full p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-6 shadow-2xl text-white">
      <audio
        ref={audioRef}
        src={activeUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Audio Visual Disc Header */}
      <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-800 p-1 flex items-center justify-center shadow-2xl">
        <div className={`w-full h-full rounded-full bg-slate-950 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
          <Radio className={`w-12 h-12 ${isPlaying ? 'text-amber-400' : 'text-slate-600'}`} />
        </div>
      </div>

      {/* Track Details */}
      <div className="flex flex-col items-center text-center gap-1">
        <h3 className="text-base font-bold text-white max-w-md truncate">{file.name}</h3>
        <span className="text-xs text-amber-400 font-mono">
          {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {file.mimeType}
        </span>
      </div>

      {/* Wave Visualizer Animation Lines */}
      <div className="flex items-center gap-1 h-8">
        {[40, 70, 30, 90, 50, 100, 60, 80, 40, 75, 20, 85, 45, 95, 60].map((h, i) => (
          <div
            key={i}
            style={{ height: isPlaying ? `${h}%` : '20%' }}
            className="w-1 bg-amber-500 rounded-full transition-all duration-300"
          />
        ))}
      </div>

      {/* Seek Track Bar */}
      <div className="w-full max-w-md flex flex-col gap-1.5">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer"
        />
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (audioRef.current) audioRef.current.muted = nextMuted;
            }}
            className="text-slate-400 hover:text-white"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-slate-800 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className="p-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-xl transition-all scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        {permissions.canDownload && onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
