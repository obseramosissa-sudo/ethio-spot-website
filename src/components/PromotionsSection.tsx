import React, { useState, useEffect } from 'react';
import { Promotion } from '../lib/firebase';
import { BusinessSpot } from '../types';

interface PromotionsSectionProps {
  promotions: Promotion[];
  businesses: BusinessSpot[];
  onSelectBusiness: (business: BusinessSpot) => void;
  onOpenPostModal: () => void;
}

function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(expiresAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
}

const PromotionCard: React.FC<{ promo: Promotion; onSelectBusiness: (business: BusinessSpot) => void; businesses: BusinessSpot[] }> = ({
  promo,
  onSelectBusiness,
  businesses,
}) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(promo.expiresAt);

  const handleCardClick = () => {
    const business = businesses.find((b) => b.id === promo.businessId);
    if (business) {
      onSelectBusiness(business);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-gradient-to-br from-white via-[#fcfdfe] to-[#f4f7f5] rounded-3xl border border-[#eceef0] p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#005f2a]/5 rounded-bl-full pointer-events-none"></div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-[#005f2a]/10 text-[#005f2a] font-bold text-[11px] uppercase tracking-wider">
            {promo.category}
          </span>
          {promo.discountBadge && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-extrabold text-[11px] shadow-xs animate-pulse">
              {promo.discountBadge}
            </span>
          )}
        </div>

        <h4 className="font-bold text-[17px] text-[#191c1e] group-hover:text-[#005f2a] transition-colors mb-1">
          {promo.title}
        </h4>
        <p className="text-[12px] font-semibold text-[#6f7a6e] mb-2">@{promo.businessName}</p>
        <p className="text-[13px] text-[#3f493f] line-clamp-3 mb-4 leading-relaxed">
          {promo.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[#eceef0] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="material-symbols-outlined text-[16px] text-amber-600">timer</span>
          {isExpired ? (
            <span className="font-bold text-red-600">Expired</span>
          ) : (
            <div className="flex items-center gap-1 font-mono font-bold text-[#191c1e]">
              {days > 0 && <span>{days}d</span>}
              <span>{String(hours).padStart(2, '0')}h</span>:
              <span>{String(minutes).padStart(2, '0')}m</span>:
              <span>{String(seconds).padStart(2, '0')}s</span>
            </div>
          )}
        </div>

        <span className="text-[12px] font-semibold text-[#005f2a] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          View Merchant
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </span>
      </div>
    </div>
  );
};

export const PromotionsSection: React.FC<PromotionsSectionProps> = ({
  promotions,
  businesses,
  onSelectBusiness,
  onOpenPostModal,
}) => {
  const activePromotions = promotions.filter((p) => new Date(p.expiresAt).getTime() > Date.now());

  return (
    <div className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">local_activity</span>
          </div>
          <div>
            <h3 className="font-extrabold text-[18px] text-[#191c1e] tracking-tight">Events & Active Promotions</h3>
            <p className="text-[12px] text-[#3f493f]">Time-sensitive discounts, sales, and local merchant events in Addis Ababa</p>
          </div>
        </div>

        <button
          onClick={onOpenPostModal}
          className="px-4 py-2.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Post Promotion</span>
        </button>
      </div>

      {activePromotions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#eceef0] p-8 text-center">
          <p className="text-[14px] text-[#3f493f] mb-3">No active promotions or events posted right now.</p>
          <button
            onClick={onOpenPostModal}
            className="text-[13px] font-bold text-[#005f2a] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Be the first merchant to post an update</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activePromotions.map((promo) => (
            <PromotionCard key={promo.id} promo={promo} onSelectBusiness={onSelectBusiness} businesses={businesses} />
          ))}
        </div>
      )}
    </div>
  );
};
