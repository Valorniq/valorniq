import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Resolve API base from environment — never hardcode localhost in component code.
const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:8000';

export default function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowBanner(false), 5000);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      scheduleHide();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setIsOnline(true);
        scheduleHide();
      }
    } catch {
      // Still offline — leave banner visible
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          {isOnline ? (
            <div className="bg-white border-2 border-green-200 rounded-xl shadow-lg p-4 flex items-center gap-3">
              <Wifi className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900 text-sm">Back Online</p>
                <p className="text-xs text-slate-500">Your connection has been restored.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-red-200 rounded-xl shadow-lg p-4 flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-sm">No Connection</p>
                <p className="text-xs text-slate-600 mt-1">
                  You're offline. Some features may be unavailable. Changes will sync when restored.
                </p>
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying…' : 'Retry'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}