'use client';

import { useState, useEffect } from 'react';
import { ViewMode } from '../utils/trackUtils';

const STORAGE_KEY = 'track-status-view-mode';
const DEFAULT_VIEW: ViewMode = 'grid';

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(DEFAULT_VIEW);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (stored && (stored === 'grid' || stored === 'table')) {
      setViewModeState(stored);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever view mode changes
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  return {
    viewMode,
    setViewMode,
    isHydrated,
  };
}
