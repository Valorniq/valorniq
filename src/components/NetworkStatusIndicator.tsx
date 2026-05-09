import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NetworkResilienceService from '../services/networkResilience';

/**
 * Network Status Indicator Component
 * Shows user when they are offline and provides retry options
 */
export default function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(NetworkResilienceService.isApplicationOnline());

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Try to connect
    try {
      const response = await fetch('http://localhost:8000/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setIsOnline(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      }
    } catch (error) {
      console.log('Still offline:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <AnimatePresence>
      {!isOnline && showMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white border-2 border-red-200 rounded-xl shadow-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0">
              <WifiOff className="w-5 h-5 text-red-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">No Connection</h3>
              <p className="text-xs text-slate-600 mt-1">
                You're offline. Some features may not work. Changes will sync when you're back online.
              </p>
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
              >
                {isRetrying && (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <RefreshCw className="w-3 h-3" />
                  </motion.div>
                )}
                {!isRetrying && <RefreshCw className="w-3 h-3" />}
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {isOnline && showMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-white border-2 border-green-200 rounded-xl shadow-lg p-4 flex items-center gap-3">
            <Wifi className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Back Online</h3>
              <p className="text-xs text-slate-600">Your connection has been restored.</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
