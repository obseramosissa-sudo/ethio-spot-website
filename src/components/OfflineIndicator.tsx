import React, { useEffect, useState } from 'react';
import { BusinessSpot } from '../types';

export function getCachedViewedBusinesses(): BusinessSpot[] {
  try {
    const raw = localStorage.getItem('ethiospot_viewed_businesses');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function cacheViewedBusiness(business: BusinessSpot) {
  try {
    const existing = getCachedViewedBusinesses();
    const filtered = existing.filter((b) => b.id !== business.id);
    const updated = [business, ...filtered].slice(0, 30); // Keep last 30 viewed businesses
    localStorage.setItem('ethiospot_viewed_businesses', JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to cache business profile offline:', err);
  }
}

export const OfflineIndicator: React.FC<{ onOpenCachedModal: () => void }> = ({ onOpenCachedModal }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cachedCount = getCachedViewedBusinesses().length;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5">
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-[12px] font-bold text-white shadow-xl backdrop-blur-md animate-in fade-in">
          <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          <span>Offline Mode — Using Cached Data</span>
          {cachedCount > 0 && (
            <button
              onClick={onOpenCachedModal}
              className="ml-1 underline hover:text-amber-100 cursor-pointer"
            >
              Browse {cachedCount} Offline Profiles
            </button>
          )}
        </div>
      )}
    </div>
  );
};
