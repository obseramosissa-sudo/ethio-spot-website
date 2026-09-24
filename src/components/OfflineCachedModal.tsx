import React from 'react';
import { BusinessSpot } from '../types';
import { getCachedViewedBusinesses } from './OfflineIndicator';

interface OfflineCachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBusiness: (b: BusinessSpot) => void;
}

export const OfflineCachedModal: React.FC<OfflineCachedModalProps> = ({
  isOpen,
  onClose,
  onSelectBusiness,
}) => {
  if (!isOpen) return null;

  const cachedBusinesses = getCachedViewedBusinesses();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#eceef0] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between bg-[#f8f9fc]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#005f2a] text-[22px]">cloud_off</span>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e]">
                Offline Cached Profiles
              </h3>
              <p className="text-[12px] text-[#6f7a6e]">
                Previously viewed business profiles stored locally for offline browsing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eceef0] hover:bg-[#e2e4e8] text-[#3f493f] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 bg-white">
          {cachedBusinesses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <span className="material-symbols-outlined text-[#9ca3af] text-[48px]">history</span>
              <p className="text-[14px] text-[#3f493f] font-medium">No offline profiles cached yet.</p>
              <p className="text-[12px] text-[#6f7a6e] max-w-sm mx-auto">
                Profiles you open while connected will be automatically saved here for offline access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cachedBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  onClick={() => {
                    onSelectBusiness(biz);
                    onClose();
                  }}
                  className="p-4 rounded-2xl border border-[#eceef0] bg-[#f8f9fc] hover:bg-[#f1f3f7] transition-all cursor-pointer flex gap-3.5 items-center shadow-xs"
                >
                  <img
                    src={biz.imageUrl}
                    alt={biz.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#eceef0]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#191c1e] truncate">
                        {biz.name}
                      </h4>
                      {biz.licenseType?.includes('Verified') && (
                        <span className="material-symbols-outlined text-[#005f2a] text-[14px]">
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#6f7a6e] truncate">{biz.category}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#3f493f]">
                      <span className="flex items-center gap-0.5 font-semibold text-amber-600">
                        ★ {biz.rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span className="text-[#6f7a6e] truncate">{biz.district}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f8f9fc] border-t border-[#eceef0] flex items-center justify-between">
          <span className="text-[11px] text-[#6f7a6e]">
            Service Worker active • {cachedBusinesses.length} profiles stored locally
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
