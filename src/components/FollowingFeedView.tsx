import React from 'react';
import { BusinessSpot } from '../types';
import { Promotion } from '../lib/firebase';

interface FollowingFeedViewProps {
  followedIds: string[];
  businesses: BusinessSpot[];
  promotions: Promotion[];
  onToggleFollow: (businessId: string) => void;
  onSelectBusiness: (b: BusinessSpot) => void;
  lang: 'EN' | 'አማ';
}

export const FollowingFeedView: React.FC<FollowingFeedViewProps> = ({
  followedIds,
  businesses,
  promotions,
  onToggleFollow,
  onSelectBusiness,
  lang,
}) => {
  const followedBusinesses = businesses.filter((b) => followedIds.includes(b.id));
  const followedPromos = promotions.filter(
    (p) => p.businessId && followedIds.includes(p.businessId)
  );

  const t = {
    EN: {
      title: 'Your Following Feed',
      subtitle: 'Real-time promotions, announcements, and updates from businesses you follow.',
      noFollowsTitle: 'No Businesses Followed Yet',
      noFollowsDesc: 'Explore Addis Ababa merchants, roasteries, and clinics, and click "Follow" to receive exclusive updates and promotion alerts.',
      followedMerchants: 'Followed Merchants',
      recentUpdates: 'Recent Promotions & Updates',
      unfollow: 'Following',
      follow: 'Follow',
      viewDetails: 'View Profile',
    },
    'አማ': {
      title: 'የሚከተሏቸው ንግዶች መረጃ',
      subtitle: 'ከተከተሏቸው ንግዶች የሚወጡ አዳዲስ ማስታወቂያዎች፣ ቅናሾች እና መረጃዎች።',
      noFollowsTitle: 'እስካሁን የተከተሉት ንግድ የለም',
      noFollowsDesc: 'የአዲስ አበባ ንግዶችን፣ ቡና ቤቶችን እና ክሊኒኮችን ይጎብኙ፣ እና ልዩ ቅናሾችን ለመከታተል "ተከተል" የሚለውን ይጫኑ።',
      followedMerchants: 'የተከተሏቸው ንግዶች',
      recentUpdates: 'አዳዲስ ቅናሾች እና ማስታወቂያዎች',
      unfollow: 'እየተከተሉ ነው',
      follow: 'ተከተል',
      viewDetails: 'መገለጫ ይመልከቱ',
    },
  }[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#005f2a] to-[#0f7a3a] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[12px] font-bold">
            <span className="material-symbols-outlined text-[16px]">rss_feed</span>
            <span>{t.title}</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[24px] md:text-[32px] font-extrabold tracking-tight">
            {t.title}
          </h1>
          <p className="text-[14px] text-white/95 max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-center flex-shrink-0">
          <span className="text-[28px] font-extrabold block">{followedBusinesses.length}</span>
          <span className="text-[12px] text-white/90 font-medium">{t.followedMerchants}</span>
        </div>
      </div>

      {followedBusinesses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#eceef0] p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#005f2a]/10 text-[#005f2a] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">bookmark_add</span>
          </div>
          <h3 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-[#191c1e]">
            {t.noFollowsTitle}
          </h3>
          <p className="text-[14px] text-[#3f493f] leading-relaxed">
            {t.noFollowsDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Followed Businesses Row */}
          <div className="space-y-4">
            <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005f2a]">verified</span>
              <span>{t.followedMerchants} ({followedBusinesses.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {followedBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  className="bg-white rounded-2xl border border-[#eceef0] p-4 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
                >
                  <img
                    src={biz.imageUrl}
                    alt={biz.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#005f2a] uppercase tracking-wide">
                      {biz.categoryLabel}
                    </span>
                    <h4
                      onClick={() => onSelectBusiness(biz)}
                      className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#191c1e] truncate cursor-pointer hover:text-[#005f2a]"
                    >
                      {lang === 'አማ' && biz.nameAmharic ? biz.nameAmharic : biz.name}
                    </h4>
                    <p className="text-[12px] text-[#6f7a6e] truncate">{biz.district}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onSelectBusiness(biz)}
                        className="text-[11px] text-[#005f2a] font-bold hover:underline cursor-pointer"
                      >
                        {t.viewDetails}
                      </button>
                      <button
                        onClick={() => onToggleFollow(biz.id)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-[#005f2a] font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer ml-auto"
                      >
                        ✓ {t.unfollow}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promotions Feed */}
          <div className="space-y-4">
            <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005f2a]">campaign</span>
              <span>{t.recentUpdates} ({followedPromos.length})</span>
            </h2>

            {followedPromos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#eceef0] p-8 text-center text-[#6f7a6e]">
                <p className="text-[14px]">No new promotions posted by your followed businesses yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {followedPromos.map((promo) => {
                  const biz = businesses.find((b) => b.id === promo.businessId);
                  return (
                    <div
                      key={promo.id || Math.random()}
                      className="bg-white rounded-3xl border border-[#eceef0] p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-[#005f2a] text-white px-4 py-1.5 rounded-bl-2xl text-[12px] font-extrabold">
                        {promo.discountBadge}
                      </div>

                      <div className="flex items-center gap-3">
                        {biz && (
                          <img
                            src={biz.imageUrl}
                            alt={biz.name}
                            className="w-11 h-11 rounded-xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div>
                          <h4 className="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-[#191c1e]">
                            {promo.title}
                          </h4>
                          <p className="text-[12px] text-[#6f7a6e]">
                            {biz ? biz.name : promo.businessName} • {new Date(promo.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-[13px] text-[#3f493f] leading-relaxed">
                        {promo.description}
                      </p>

                      {biz && (
                        <div className="pt-2 flex items-center justify-between border-t border-[#eceef0]">
                          <span className="text-[11px] font-semibold text-[#005f2a]">
                            Valid in {biz.district}
                          </span>
                          <button
                            onClick={() => onSelectBusiness(biz)}
                            className="px-4 py-1.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[12px] font-bold transition-all cursor-pointer"
                          >
                            View Business
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
