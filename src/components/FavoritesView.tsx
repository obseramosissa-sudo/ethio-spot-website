import React from 'react';
import { BusinessSpot } from '../types';

interface FavoritesViewProps {
  businesses: BusinessSpot[];
  favoriteIds: string[];
  onToggleFavorite: (businessId: string) => void;
  onSelectBusiness: (business: BusinessSpot) => void;
  user: any;
  onNavigateDiscover: () => void;
  onSignInRequired: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  businesses,
  favoriteIds,
  onToggleFavorite,
  onSelectBusiness,
  user,
  onNavigateDiscover,
  onSignInRequired,
}) => {
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#005f2a]/10 text-[#005f2a] flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">favorite</span>
        </div>
        <h2 className="font-bold text-[22px] text-[#191c1e] mb-2">My Favorites Collection</h2>
        <p className="text-[14px] text-[#3f493f] max-w-md mx-auto mb-6">
          Sign in with Google to save your favorite Addis Ababa merchants, access them across your devices, and build a custom directory.
        </p>
        <button
          onClick={onSignInRequired}
          className="px-6 py-3 rounded-2xl bg-[#005f2a] text-white font-semibold text-[14px] hover:bg-[#0f7a3a] transition-colors shadow-sm cursor-pointer"
        >
          Sign In to View Favorites
        </button>
      </div>
    );
  }

  const favoriteBusinesses = businesses.filter((b) => favoriteIds.includes(b.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-extrabold text-[#191c1e] tracking-tight">My Saved Favorites</h1>
            <span className="px-3 py-1 rounded-full bg-[#005f2a]/10 text-[#005f2a] font-bold text-[13px]">
              {favoriteBusinesses.length} {favoriteBusinesses.length === 1 ? 'Business' : 'Businesses'}
            </span>
          </div>
          <p className="text-[14px] text-[#3f493f] mt-1">
            Your personal verified Addis Ababa merchant bookmarks securely stored in Firestore.
          </p>
        </div>
      </div>

      {favoriteBusinesses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#eceef0] p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[30px]">heart_broken</span>
          </div>
          <h3 className="text-[18px] font-bold text-[#191c1e] mb-2">No Saved Favorites Yet</h3>
          <p className="text-[14px] text-[#3f493f] mb-6">
            Explore Addis Ababa commercial directory and click the heart icon on any business to save it to your personal favorites list.
          </p>
          <button
            onClick={onNavigateDiscover}
            className="px-6 py-3 rounded-xl bg-[#005f2a] text-white font-semibold text-[14px] hover:bg-[#0f7a3a] transition-colors shadow-sm cursor-pointer"
          >
            Explore Directory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteBusinesses.map((business) => (
            <div
              key={business.id}
              className="bg-white rounded-3xl border border-[#eceef0] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col group cursor-pointer"
              onClick={() => onSelectBusiness(business)}
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={business.imageUrl}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Favorite Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(business.id);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-rose-600 flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                  title="Remove from favorites"
                >
                  <span className="material-symbols-outlined text-[20px] font-variation-settings-filled">
                    favorite
                  </span>
                </button>

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#005f2a]">
                    {business.categoryLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-medium text-white">
                    {business.district}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[16px] text-[#191c1e] group-hover:text-[#005f2a] transition-colors">
                      {business.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 text-[13px] font-bold">
                      <span className="material-symbols-outlined text-[16px] font-variation-settings-filled">
                        star
                      </span>
                      <span>{business.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#6f7a6e] mb-3">{business.nameAmharic}</p>
                  <p className="text-[13px] text-[#3f493f] line-clamp-2 mb-4">
                    {business.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#eceef0] flex items-center justify-between text-[12px] text-[#6f7a6e]">
                  <div className="flex items-center gap-1.5 font-medium text-[#191c1e]">
                    <span className="material-symbols-outlined text-[16px] text-[#005f2a]">verified</span>
                    <span>MoT: {business.licenseNumber}</span>
                  </div>
                  <span className="text-[#005f2a] font-semibold flex items-center gap-0.5 group-hover:underline">
                    View Profile
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
