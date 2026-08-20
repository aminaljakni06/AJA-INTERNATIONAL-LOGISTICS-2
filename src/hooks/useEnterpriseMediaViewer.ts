/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Media Viewer Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Media Preview, Document Viewer & Attachment Dialog System
 * Version: 1.0
 */

import { useState, useCallback } from 'react';
import { FileMetadata } from '../types/fileManagementFramework';
import { MediaViewerState, ViewerError } from '../types/mediaViewerFramework';

export function useEnterpriseMediaViewer(initialFiles: FileMetadata[] = [], initialIndex: number = 0) {
  const [files, setFiles] = useState<FileMetadata[]>(initialFiles);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [state, setState] = useState<MediaViewerState>({
    zoomLevel: 1,
    rotationAngle: 0,
    currentPage: 1,
    totalPages: 1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackSpeed: 1,
    isFullscreen: false,
    showInfoPanel: false,
    isLoading: false,
    error: null,
  });

  const activeFile = files[currentIndex] || null;

  const openViewer = useCallback((playlist: FileMetadata[], startIndex: number = 0) => {
    setFiles(playlist);
    setCurrentIndex(startIndex);
    setIsOpen(true);
    setState((prev) => ({
      ...prev,
      zoomLevel: 1,
      rotationAngle: 0,
      currentPage: 1,
      error: null,
    }));
  }, []);

  const closeViewer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const navigateNext = useCallback(() => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setState((prev) => ({ ...prev, zoomLevel: 1, rotationAngle: 0, error: null }));
    }
  }, [currentIndex, files.length]);

  const navigatePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setState((prev) => ({ ...prev, zoomLevel: 1, rotationAngle: 0, error: null }));
    }
  }, [currentIndex]);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoomLevel: Math.max(0.25, Math.min(zoom, 4)) }));
  }, []);

  const rotate = useCallback(() => {
    setState((prev) => ({ ...prev, rotationAngle: (prev.rotationAngle + 90) % 360 }));
  }, []);

  const toggleInfoPanel = useCallback(() => {
    setState((prev) => ({ ...prev, showInfoPanel: !prev.showInfoPanel }));
  }, []);

  return {
    isOpen,
    files,
    currentIndex,
    activeFile,
    state,
    openViewer,
    closeViewer,
    navigateNext,
    navigatePrevious,
    setZoom,
    rotate,
    toggleInfoPanel,
  };
}
