import React, { useState, useEffect, useMemo } from 'react';
import { BusinessSpot, District, NavigationTab } from '../types';
import { DIRECTORY_CATEGORIES, TRENDING_TAGS, MAP_BACKGROUND_IMAGE } from '../data/businesses';
import { Promotion } from '../lib/firebase';
import { PromotionsSection } from './PromotionsSection';
import { BusinessAssistantChat } from './BusinessAssistantChat';
import { SuggestedForYouSection } from './SuggestedForYouSection';

interface DiscoverViewProps {
  businesses: BusinessSpot[];
  selectedDistrict: District;
  setSelectedDistrict: (d: District) => void;
  setActiveTab: (tab: NavigationTab) => void;
  onSelectBusiness: (b: BusinessSpot) => void;
  onRequestQuote: (b?: BusinessSpot) => void;
  onOpenMap: (b?: BusinessSpot) => void;
  lang: 'EN' | 'አማ';
  onOpenExportPdf?: () => void;
  promotions: Promotion[];
  onOpenPostModal: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  businesses,
  selectedDistrict,
  setSelectedDistrict,
  setActiveTab,
  onSelectBusiness,
  onRequestQuote,
  onOpenMap,
  lang,
  onOpenExportPdf,
  promotions,
  onOpenPostModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrendingTag, setActiveTrendingTag] = useState<string | null>(null);
  const [selectedPriceTier, setSelectedPriceTier] = useState<'all' | 'economy' | 'standard' | 'premium'>('all');
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [isFindNearbyActive, setIsFindNearbyActive] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({ lat: 8.9806, lng: 38.7578 });
  const [locatingStatus, setLocatingStatus] = useState<string>('Auto-detecting your location for nearby recommendations...');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocatingStatus('Location auto-detected via GPS. Showing closest businesses.');
          setTimeout(() => setLocatingStatus(''), 4500);
        },
        (err) => {
          console.warn('Auto geolocation fallback:', err);
          setUserCoords({ lat: 8.9806, lng: 38.7578 });
          setLocatingStatus('Using Bole commercial reference center for proximity.');
          setTimeout(() => setLocatingStatus(''), 4000);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    } else {
      setUserCoords({ lat: 8.9806, lng: 38.7578 });
      setLocatingStatus('Geolocation not supported. Sorted by Bole commercial center.');
      setTimeout(() => setLocatingStatus(''), 4000);
    }
  }, []);

  // Handle trending tag click
  const handleTagClick = (tagLabel: string) => {
    if (activeTrendingTag === tagLabel) {
      setActiveTrendingTag(null);
      setSearchQuery('');
    } else {
      setActiveTrendingTag(tagLabel);
      const tagObj = TRENDING_TAGS.find((t) => t.label === tagLabel);
      if (tagObj) setSearchQuery(tagObj.query);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  const handleToggleFindNearby = () => {
    if (!isFindNearbyActive) {
      setIsFindNearbyActive(true);
      setLocatingStatus('Acquiring your GPS location...');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLocatingStatus('Sorted by GPS location distance');
          },
          (err) => {
            console.warn('Geolocation fallback:', err);
            setUserCoords({ lat: 8.9806, lng: 38.7578 });
            setLocatingStatus('Using Bole reference center for distance');
          },
          { timeout: 8000 }
        );
      } else {
        setUserCoords({ lat: 8.9806, lng: 38.7578 });
        setLocatingStatus('Geolocation not supported, using Bole reference');
      }
    } else {
      setIsFindNearbyActive(false);
      setUserCoords(null);
      setLocatingStatus('');
    }
  };

  const processedBusinesses = useMemo(() => {
    return businesses.map((b) => {
      if (userCoords) {
        const dist = calculateDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return { ...b, distanceKm: dist };
      }
      return b;
    });
  }, [businesses, userCoords]);

  const sortedBusinesses = useMemo(() => {
    const list = [...processedBusinesses];
    if (isFindNearbyActive) {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return list;
  }, [processedBusinesses, isFindNearbyActive]);

  const getPriceTier = (b: BusinessSpot): 'economy' | 'standard' | 'premium' => {
    const p = b.priceRange.toLowerCase();
    if (p.includes('32,000') || p.includes('1,800') || p.includes('1,500') || p.includes('enterprise') || p.includes('delivery')) {
      return 'premium';
    }
    if (p.includes('600') || p.includes('350') || p.includes('750') || p.includes('220') || p.includes('cover')) {
      return 'standard';
    }
    return 'economy';
  };

  const matchesPriceTier = (b: BusinessSpot) => {
    if (selectedPriceTier === 'all') return true;
    return getPriceTier(b) === selectedPriceTier;
  };

  // Filtered lists
  const popularSpots = useMemo(() => {
    const filtered = sortedBusinesses.filter((b) =>
      ['tomoca-bole', 'boston-day-spa', 'bethzatha-clinic'].includes(b.id) && matchesPriceTier(b)
    );
    return isFindNearbyActive ? filtered.sort((a, b) => a.distanceKm - b.distanceKm) : filtered;
  }, [sortedBusinesses, isFindNearbyActive, selectedPriceTier]);

  const accreditedEnterprises = useMemo(() => {
    const filtered = sortedBusinesses.filter((b) =>
      ['kategna-restaurant', 'habesha-tech', 'sabahar-textiles'].includes(b.id) && matchesPriceTier(b)
    );
    return isFindNearbyActive ? filtered.sort((a, b) => a.distanceKm - b.distanceKm) : filtered;
  }, [sortedBusinesses, isFindNearbyActive, selectedPriceTier]);

  // Dynamic filter for search query and price tier
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && selectedDistrict === 'All Commercial Districts' && selectedPriceTier === 'all' && !isFindNearbyActive) {
      return null;
    }
    const list = sortedBusinesses.filter((b) => {
      const matchesDistrict =
        selectedDistrict === 'All Commercial Districts' || b.district === selectedDistrict;
      const matchesPrice = matchesPriceTier(b);
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesDistrict && matchesPrice;
      const matchesQuery =
        b.name.toLowerCase().includes(q) ||
        b.nameAmharic.includes(q) ||
        b.categoryLabel.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)) ||
        b.address.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);
      return matchesDistrict && matchesPrice && matchesQuery;
    });
    if (isFindNearbyActive) {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return list;
  }, [sortedBusinesses, searchQuery, selectedDistrict, selectedPriceTier, isFindNearbyActive]);

  const toggleRadius = () => {
    setRadiusKm((prev) => (prev === 2 ? 5 : prev === 5 ? 10 : 2));
  };

  return (
    <div className="w-full flex-1">
      {/* Hero Command Section with Integrated Search Hub */}
      <section className="relative w-full bg-gradient-to-b from-[#f2f4f6]/80 via-[#f8f9fc] to-[#f8f9fc] pt-12 pb-16 px-4 lg:px-8 overflow-hidden">
        {/* Glow ambient background blobs */}
        <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-[#97f8a9]/25 blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-[#ffdf9d]/30 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Live Status & Weather Indicator Capsule */}
          <div className="inline-flex items-center gap-1 bg-white border border-[#eceef0] py-1.5 px-4 rounded-full shadow-sm mb-6 flex-wrap justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005f2a] animate-pulse"></span>
            <span className="text-[12px] text-[#3f493f] font-medium">
              Bole Medhanialem Commercial Zone • Live Market Index • Active Trade Registry
            </span>
            <span className="mx-1 text-[#becabc] text-[12px]">•</span>
            <span className="material-symbols-outlined text-[#005f2a] text-[16px]">near_me</span>
            <span className="text-[12px] text-[#005f2a] font-bold">
              Bole, Addis Ababa • Live GPS
            </span>
          </div>

          {/* Headline & Subtext */}
          <h1 className="font-['Plus_Jakarta_Sans'] text-[36px] sm:text-[44px] md:text-[46px] md:leading-[54px] font-bold text-[#191c1e] tracking-tight max-w-3xl mb-3">
            Empowering{' '}
            <span className="text-[#005f2a] underline decoration-[#f9bd00]/70 decoration-wavy decoration-2 underline-offset-8">
              Ethiopian Commerce & Local Trade
            </span>
          </h1>
          <div className="mb-8 flex flex-col items-center gap-2 max-w-2xl">
            <p className="text-[16px] leading-relaxed text-[#3f493f]">
              The verified EthioSpot registry connecting enterprise buyers, local residents, and diaspora investors with accredited merchants across Addis Ababa and regional commercial hubs.
            </p>
            <p className="text-[14px] leading-relaxed text-[#005f2a] font-semibold bg-[#005f2a]/8 px-4 py-1.5 rounded-full border border-[#005f2a]/15 shadow-sm">
              🇪🇹 EthioSpot — የተረጋገጡ የኢትዮጵያ ንግድ ተቋማት እና የገበያ ማዕከላት መግቢያ
            </p>
          </div>

          {/* Elevated Omnibox Search Command Capsule */}
          <div className="w-full bg-white rounded-3xl p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#eceef0] flex flex-col md:flex-row items-stretch gap-2 transition-all hover:shadow-[0_12px_40px_rgba(0,95,42,0.08)]">
            {/* Input 1: Query Input */}
            <div className="flex-[1.5] flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#f2f4f6]/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#005f2a]/30 transition-all">
              <span className="material-symbols-outlined text-[#005f2a] text-[22px]">search</span>
              <input
                className="w-full bg-transparent border-none outline-none text-[14px] text-[#191c1e] placeholder:text-[#6f7a6e]"
                placeholder="Search registered businesses, trade categories, or license types..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#6f7a6e] hover:text-[#191c1e] text-[12px] p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Input 2: Sub-city Filter */}
            <div className="flex-1 flex items-center gap-1 px-4 py-3 rounded-2xl bg-[#f2f4f6]/60 focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-[#3f493f] text-[20px]">location_on</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value as District)}
                className="w-full bg-transparent border-none outline-none text-[14px] font-semibold text-[#191c1e] cursor-pointer pr-3"
              >
                <option value="All Commercial Districts">All Commercial Districts (Bole, Kazanchis, Piazza, Mercato)</option>
                <option value="Bole Medhanialem & Atlas">Bole Medhanialem & Atlas</option>
                <option value="Kazanchis & UNECA Area">Kazanchis & UNECA Area</option>
                <option value="Megenagna & CMC">Megenagna & CMC</option>
                <option value="Piazza & Arat Kilo">Piazza & Arat Kilo</option>
                <option value="Sarbet & Bisrate Gabriel">Sarbet & Bisrate Gabriel</option>
                <option value="Mercato & Kirkos">Mercato & Kirkos</option>
              </select>
            </div>

            {/* Near Me Action Button */}
            <button
              onClick={toggleRadius}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-[#eceef0] hover:bg-[#e7e8eb] transition-colors text-[12px] text-[#191c1e] font-semibold flex-shrink-0"
              type="button"
              title="Click to toggle radius distance"
            >
              <span className="material-symbols-outlined text-[#005f2a] text-[18px]">my_location</span>
              <span>Local Radius: {radiusKm}km</span>
            </button>

            {/* Find Nearby Toggle Button */}
            <button
              onClick={handleToggleFindNearby}
              className={`flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl transition-all text-[12px] font-bold flex-shrink-0 cursor-pointer ${
                isFindNearbyActive
                  ? 'bg-[#005f2a] text-white shadow-sm'
                  : 'bg-[#eceef0] hover:bg-[#e7e8eb] text-[#191c1e]'
              }`}
              type="button"
              title="Toggle Find Nearby GPS distance sorting"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFindNearbyActive ? 'gps_fixed' : 'near_me'}
              </span>
              <span>{isFindNearbyActive ? 'Find Nearby: ON' : 'Find Nearby'}</span>
            </button>

            {/* Search Action CTA */}
            <button
              onClick={() => {
                if (searchResults && searchResults.length > 0) {
                  onSelectBusiness(searchResults[0]);
                }
              }}
              className="flex items-center justify-center gap-1 px-8 py-3 rounded-2xl bg-[#005f2a] text-white font-['Plus_Jakarta_Sans'] text-[16px] font-semibold hover:bg-[#0f7a3a] transition-all shadow-[0_4px_12px_rgba(0,95,42,0.25)] flex-shrink-0"
              type="button"
            >
              <span>Search Registry</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>

          {/* Quick Trending Filter Tags */}
          <div className="w-full flex items-center justify-center flex-wrap gap-2 mt-6">
            <span className="text-[11px] text-[#6f7a6e] uppercase tracking-wider font-semibold mr-1">
              Trending:
            </span>
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => handleTagClick(tag.label)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border shadow-sm transition-all flex items-center gap-1.5 ${
                  activeTrendingTag === tag.label
                    ? 'bg-[#005f2a] text-white border-[#005f2a]'
                    : 'bg-white hover:bg-[#e7e8eb] text-[#191c1e] border-[#eceef0]'
                }`}
              >
                <span>
                  {tag.emoji} {tag.label}
                </span>
              </button>
            ))}
          </div>

          {/* Price Range Filter Toggle */}
          <div className="w-full flex items-center justify-center flex-wrap gap-2 mt-3">
            <span className="text-[11px] text-[#6f7a6e] uppercase tracking-wider font-semibold mr-1">
              Price Range:
            </span>
            {(
              [
                { key: 'all', label: 'All Prices' },
                { key: 'economy', label: 'Economy ($)' },
                { key: 'standard', label: 'Standard ($$)' },
                { key: 'premium', label: 'Premium ($$$)' },
              ] as const
            ).map((tier) => (
              <button
                key={tier.key}
                type="button"
                onClick={() => setSelectedPriceTier(tier.key)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border shadow-sm transition-all flex items-center gap-1.5 ${
                  selectedPriceTier === tier.key
                    ? 'bg-[#005f2a] text-white border-[#005f2a]'
                    : 'bg-white hover:bg-[#e7e8eb] text-[#191c1e] border-[#eceef0]'
                }`}
              >
                <span>{tier.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Offline PDF Export Capsule */}
          {onOpenExportPdf && (
            <div className="mt-4 flex items-center justify-center gap-3 animate-in fade-in">
              <button
                type="button"
                onClick={onOpenExportPdf}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#005f2a] text-[12px] font-bold shadow-xs border border-[#005f2a]/20 hover:border-[#005f2a]/40 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
                <span>Export Directory to PDF (Offline Printable)</span>
              </button>
            </div>
          )}

          {/* Live Search Results Preview if searching */}
          {locatingStatus && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#005f2a] text-[12px] font-bold animate-in fade-in">
              <span className="material-symbols-outlined text-[16px]">my_location</span>
              <span>{locatingStatus}</span>
            </div>
          )}

          {searchResults && (
            <div className="w-full mt-6 bg-white rounded-2xl p-4 border border-[#eceef0] shadow-md text-left animate-in fade-in">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eceef0]">
                <span className="text-[13px] font-bold text-[#191c1e]">
                  Search Results ({searchResults.length} verified listings)
                </span>
                <div className="flex items-center gap-3">
                  {onOpenExportPdf && (
                    <button
                      type="button"
                      onClick={onOpenExportPdf}
                      className="text-[12px] text-[#005f2a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                      <span>Export PDF ({searchResults.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveTrendingTag(null);
                    }}
                    className="text-[12px] text-[#6f7a6e] hover:underline font-semibold cursor-pointer"
                  >
                    Clear filter
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onSelectBusiness(b)}
                    className="p-3 rounded-xl border border-[#eceef0] hover:border-[#005f2a] hover:bg-[#f8f9fc] cursor-pointer transition-all flex gap-3 items-center"
                  >
                    <img src={b.imageUrl} alt={b.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#191c1e] truncate">{b.name}</p>
                      <p className="text-[11px] text-[#3f493f]">{b.subCategory}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#005f2a] font-semibold">{b.priceRange}</span>
                        <span className="text-[#becabc] text-[10px]">•</span>
                        <span className="inline-flex items-center gap-0.5 text-[11px] text-[#005f2a] font-bold">
                          <span className="material-symbols-outlined text-[12px]">near_me</span>
                          {b.distanceKm} km
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events & Promotions Section */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-8">
        <PromotionsSection
          promotions={promotions}
          businesses={businesses}
          onSelectBusiness={onSelectBusiness}
          onOpenPostModal={onOpenPostModal}
        />
      </section>

      {/* Categories Strip: 8 Micro Cards Row */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-[11px] text-[#005f2a] uppercase font-bold tracking-widest block">
              Directory Hub
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] font-semibold text-[#191c1e] mt-0.5">
              Official Sector Directory
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('categories')}
            className="text-[14px] text-[#005f2a] hover:underline flex items-center gap-1 font-semibold group cursor-pointer"
          >
            <span>Browse all 24 industry sectors →</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
              chevron_right
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {DIRECTORY_CATEGORIES.slice(0, 8).map((cat) => {
            const isGreen = cat.color === 'primary';
            const isGold = cat.color === 'secondary';
            const isBlue = cat.color === 'tertiary';
            const isRed = cat.color === 'error';

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab('categories')}
                className={`group p-4 bg-white rounded-2xl border border-[#eceef0] hover:shadow-md transition-all flex flex-col items-center text-center focus:outline-none ${
                  isGreen
                    ? 'hover:border-[#005f2a]/30'
                    : isGold
                    ? 'hover:border-[#f9bd00]'
                    : isBlue
                    ? 'hover:border-[#045971]/40'
                    : 'hover:border-[#ba1a1a]/40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors mb-2.5 ${
                    isGreen
                      ? 'bg-[#97f8a9]/40 text-[#005f2a] group-hover:bg-[#005f2a] group-hover:text-white'
                      : isGold
                      ? 'bg-[#ffdf9d]/50 text-[#785a00] group-hover:bg-[#f9bd00] group-hover:text-[#251a00]'
                      : isBlue
                      ? 'bg-[#bde9ff] text-[#045971] group-hover:bg-[#045971] group-hover:text-white'
                      : 'bg-[#ffdad6]/60 text-[#ba1a1a] group-hover:bg-[#ba1a1a] group-hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                </div>
                <span
                  className={`font-['Plus_Jakarta_Sans'] text-[15px] font-semibold text-[#191c1e] line-clamp-1 transition-colors ${
                    isGreen
                      ? 'group-hover:text-[#005f2a]'
                      : isGold
                      ? 'group-hover:text-[#785a00]'
                      : isBlue
                      ? 'group-hover:text-[#045971]'
                      : 'group-hover:text-[#ba1a1a]'
                  }`}
                >
                  {cat.name}
                </span>
                <span className="text-[11px] text-[#3f493f] mt-0.5">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Side-by-Side Dual Bento Explorer: Concierge (Left 50%) & Interactive Live Map (Right 50%) */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Spot Concierge Assistant Card (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#005f2a] via-[#0f7a3a] to-[#045971] text-white rounded-3xl p-6 lg:p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md mb-4">
                <span className="material-symbols-outlined text-[16px] text-[#f9bd00]">support_agent</span>
                <span className="text-[11px] font-semibold tracking-wide">Trade Concierge • B2B Procurement</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-[28px] lg:text-[32px] font-bold leading-tight mb-3 text-white">
                Procuring commercial goods or services in Addis?
              </h3>
              <p className="text-[14px] text-white/85 mb-6 leading-relaxed">
                Need bulk coffee supply, enterprise IT workstations, or vetted legal and dental clinics? Contact our business concierge team directly for commercial inquiries.
              </p>
              {/* Direct Contact Channels */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <a
                  href="https://t.me/EthioSpotB2B"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3.5 py-2 rounded-xl backdrop-blur-sm transition-colors text-white"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#97f8a9]">send</span>
                  <span className="text-[11px] font-semibold">@EthioSpotB2B</span>
                </a>
                <a
                  href="tel:+251911234567"
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3.5 py-2 rounded-xl backdrop-blur-sm transition-colors text-white"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#97f8a9]">call</span>
                  <span className="text-[11px] font-semibold">+251 911 234 567</span>
                </a>
              </div>
            </div>

            {/* Concierge Action CTAs */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => onRequestQuote()}
                className="flex-1 py-3 px-4 rounded-xl bg-[#fdc002] text-[#6c5000] font-['Plus_Jakarta_Sans'] text-[15px] font-bold hover:brightness-105 transition-all text-center shadow-sm cursor-pointer"
                type="button"
              >
                Request Merchant Quote
              </button>
              <button
                onClick={() => onRequestQuote()}
                aria-label="Open Concierge Chat"
                className="p-3 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all flex items-center justify-center cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </button>
            </div>
          </div>

          {/* Right: Addis Live Map Preview (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 lg:p-6 shadow-sm border border-[#eceef0] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#005f2a]/10 text-[#005f2a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">explore</span>
                </div>
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] text-[18px] font-semibold text-[#191c1e]">
                    Addis Ababa Commercial GIS Map
                  </h4>
                  <p className="text-[12px] text-[#3f493f]">
                    48 verified enterprises active in Bole & Kirkos trade corridors
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#97f8a9]/40 text-[#005f2a] text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#005f2a] animate-ping"></span>
                Live Trade Map
              </span>
            </div>

            {/* Geospatial Map Container */}
            <div
              className="w-full h-64 lg:h-72 rounded-2xl relative overflow-hidden bg-cover bg-center shadow-inner border border-[#eceef0]"
              style={{ backgroundImage: `url('${MAP_BACKGROUND_IMAGE}')` }}
            >
              {/* Map Pin Overlay 1: Tomoca Bole */}
              <button
                type="button"
                onClick={() => {
                  const b = businesses.find((x) => x.id === 'tomoca-bole');
                  if (b) onSelectBusiness(b);
                }}
                className="absolute top-8 left-10 bg-white/95 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-[#eceef0] transition-transform hover:scale-105"
              >
                <span className="material-symbols-outlined text-[#005f2a] text-[18px]">local_cafe</span>
                <span className="text-[11px] text-[#191c1e] font-bold">Tomoca Bole</span>
              </button>

              {/* Map Pin Overlay 2: Kategna Resto */}
              <button
                type="button"
                onClick={() => {
                  const b = businesses.find((x) => x.id === 'kategna-restaurant');
                  if (b) onSelectBusiness(b);
                }}
                className="absolute bottom-10 left-1/3 bg-white/95 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-[#eceef0] transition-transform hover:scale-105"
              >
                <span className="material-symbols-outlined text-[#785a00] text-[18px]">restaurant</span>
                <span className="text-[11px] text-[#191c1e] font-bold">Kategna Resto</span>
              </button>

              {/* Map Pin Overlay 3: Bethzatha 24/7 */}
              <button
                type="button"
                onClick={() => {
                  const b = businesses.find((x) => x.id === 'bethzatha-clinic');
                  if (b) onSelectBusiness(b);
                }}
                className="absolute top-14 right-12 bg-white/95 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-[#eceef0] transition-transform hover:scale-105"
              >
                <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">local_hospital</span>
                <span className="text-[11px] text-[#191c1e] font-bold">Bethzatha 24/7</span>
              </button>

              {/* Bottom Floating Action Button inside Map */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('map-view')}
                  className="px-4 py-2.5 rounded-xl bg-[#005f2a] text-white text-[12px] font-semibold shadow-md hover:bg-[#0f7a3a] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  <span>Open Commercial Map</span>
                </button>
              </div>
            </div>

            {/* Bottom Micro Status Strip */}
            <div className="flex items-center justify-between pt-3 text-[#3f493f] text-[12px]">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005f2a]"></span> Open for Business
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f9bd00]"></span> MoT Certified
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#045971]"></span> Delivery Logistics
                </span>
              </div>
              <span className="text-[11px] text-[#6f7a6e]">Updated 2 mins ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Near You (3-Column Clean Card Grid) */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[#005f2a] text-[20px]">recommend</span>
              <span className="text-[11px] text-[#005f2a] uppercase font-bold tracking-wider">
                High-Volume Commercial Hubs
              </span>
            </div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] font-semibold text-[#191c1e]">
              Popular Near You
            </h2>
            <p className="text-[14px] text-[#3f493f] mt-0.5">
              Highest-rated trade partners in Bole, Atlas & Kirkos corridors
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {onOpenExportPdf && (
              <button
                type="button"
                onClick={onOpenExportPdf}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#005f2a]/30 hover:bg-[#97f8a9]/20 text-[#005f2a] text-[13px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
                <span>Export PDF</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('categories')}
              className="text-[14px] text-[#005f2a] hover:underline flex items-center gap-1 font-semibold group cursor-pointer"
            >
              <span>View all accredited spots (140+) →</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* 3 Desktop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularSpots.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-[#eceef0]"
            >
              <div>
                <div
                  onClick={() => onSelectBusiness(spot)}
                  className="relative w-full h-52 overflow-hidden bg-[#eceef0] cursor-pointer"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={spot.imageUrl}
                    alt={spot.name}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#191c1e] px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[#005f2a] text-[14px]">verified</span>
                    <span>{spot.licenseType}</span>
                  </div>
                  <div
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-sm text-white ${
                      spot.id === 'bethzatha-clinic' ? 'bg-[#ba1a1a]' : 'bg-[#005f2a]'
                    }`}
                  >
                    {spot.id === 'bethzatha-clinic' ? '24/7 Emergency' : 'Open for Business'}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[#3f493f] font-medium">{spot.subCategory}</span>
                    <span className="text-[11px] text-[#005f2a] font-bold">{spot.priceRange}</span>
                  </div>
                  <h3
                    onClick={() => onSelectBusiness(spot)}
                    className="font-['Plus_Jakarta_Sans'] text-[18px] font-semibold text-[#191c1e] group-hover:text-[#005f2a] transition-colors cursor-pointer leading-snug"
                  >
                    {spot.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 mb-2 flex-wrap">
                    <div className="flex items-center text-[#fdc002]">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="text-[12px] text-[#191c1e] font-bold ml-1">{spot.rating}</span>
                    </div>
                    <span className="text-[12px] text-[#3f493f]">({spot.reviewCount})</span>
                    <span className="text-[#becabc] text-[12px]">•</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#005f2a] text-[11px] font-bold border border-emerald-200">
                      <span className="material-symbols-outlined text-[13px]">near_me</span>
                      {spot.distanceKm} km away
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {spot.paymentMethods.map((pm) => (
                      <span
                        key={pm}
                        className="px-2 py-0.5 rounded-md bg-[#bde9ff] text-[#001f2a] text-[11px] font-semibold"
                      >
                        {pm}
                      </span>
                    ))}
                    {spot.id === 'tomoca-bole' && (
                      <span className="px-2 py-0.5 rounded-md bg-[#eceef0] text-[#3f493f] text-[11px]">
                        WiFi
                      </span>
                    )}
                    {spot.id === 'boston-day-spa' && (
                      <span className="px-2 py-0.5 rounded-md bg-[#eceef0] text-[#3f493f] text-[11px]">
                        Appointment Req
                      </span>
                    )}
                    {spot.id === 'bethzatha-clinic' && (
                      <span className="px-2 py-0.5 rounded-md bg-[#97f8a9] text-[#00210a] text-[11px] font-semibold">
                        Bike Dispatch
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (spot.id === 'tomoca-bole') onSelectBusiness(spot);
                    else if (spot.id === 'boston-day-spa') onRequestQuote(spot);
                    else window.open(`tel:${spot.phone}`);
                  }}
                  className="flex-1 py-2.5 px-2 rounded-xl bg-[#e7e8eb] hover:bg-[#e1e2e5] text-[#191c1e] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#005f2a]">call</span>
                  <span>
                    {spot.id === 'tomoca-bole'
                      ? 'Inquire Spot'
                      : spot.id === 'boston-day-spa'
                      ? 'Book Desk'
                      : 'Emergency Line'}
                  </span>
                </button>
                <button
                  onClick={() => onOpenMap(spot)}
                  className="flex-1 py-2.5 px-2 rounded-xl bg-[#005f2a] text-white text-[12px] font-semibold hover:bg-[#0f7a3a] flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  <span>Map Route</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Ethiopian Businesses Section (Editorial Alternating Row Layout) */}
      <section className="w-full bg-[#f2f4f6]/60 border-y border-[#eceef0] py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#97f8a9]/50 text-[#00210a] mb-2.5 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Government License Verified</span>
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] font-semibold text-[#191c1e]">
                MoT Accredited Ethiopian Enterprises
              </h2>
              <p className="text-[14px] text-[#3f493f] mt-0.5">
                Vetted and certified in coordination with the Ministry of Trade and Regional Integration
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <span className="text-[12px] text-[#6f7a6e]">
                Showing {accreditedEnterprises.length} of 850+ verified listings
              </span>
            </div>
          </div>

          {/* 3 Rich Detailed Cards */}
          <div className="space-y-5">
            {accreditedEnterprises.map((ent) => (
              <div
                key={ent.id}
                className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-[#eceef0] hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 items-center"
              >
                <div
                  onClick={() => onSelectBusiness(ent)}
                  className="w-full lg:w-72 h-52 rounded-xl overflow-hidden flex-shrink-0 bg-[#eceef0] cursor-pointer"
                >
                  <img
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    src={ent.imageUrl}
                    alt={ent.name}
                  />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => onSelectBusiness(ent)}
                        className="font-['Plus_Jakarta_Sans'] text-[18px] md:text-[20px] font-bold text-[#191c1e] hover:text-[#005f2a] cursor-pointer transition-colors"
                      >
                        {ent.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#005f2a]/10 text-[#005f2a] text-[11px] font-semibold">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        {ent.id === 'sabahar-textiles'
                          ? `Fair Trade Certified & MoT #${ent.licenseNumber}`
                          : `MoT Certified License #${ent.licenseNumber}`}
                      </span>
                    </div>
                    <span className="font-['Plus_Jakarta_Sans'] text-[16px] text-[#005f2a] font-bold">
                      {ent.priceRange}
                    </span>
                  </div>

                  <p className="text-[14px] text-[#3f493f] mb-3 leading-relaxed">
                    {ent.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-[#3f493f] text-[12px] mb-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px] text-[#005f2a]">
                        location_on
                      </span>
                      {ent.address}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#005f2a] text-[11px] font-bold border border-emerald-200">
                      <span className="material-symbols-outlined text-[13px]">near_me</span>
                      {ent.distanceKm} km away
                    </span>
                    <span className="flex items-center gap-1 text-[#785a00] font-bold">
                      <span
                        className="material-symbols-outlined text-[16px] text-[#fdc002]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      {ent.rating} ({ent.reviewCount}+ Reviews)
                    </span>
                    <span className="flex items-center gap-1 text-[#005f2a] font-medium">
                      <span className="material-symbols-outlined text-[16px]">
                        {ent.id === 'sabahar-textiles' ? 'local_shipping' : ent.id === 'habesha-tech' ? 'check_circle' : 'schedule'}
                      </span>
                      {ent.id === 'sabahar-textiles'
                        ? 'Worldwide Shipping'
                        : ent.id === 'habesha-tech'
                        ? '1 Yr Local Warranty'
                        : `Open until ${ent.hours.split('-')[1]?.trim() || '11:00 PM'}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e7e8eb]/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {ent.paymentMethods.map((pm) => (
                        <span
                          key={pm}
                          className="px-2.5 py-1 rounded-md bg-[#bde9ff] text-[#001f2a] text-[11px] font-semibold"
                        >
                          {pm}
                        </span>
                      ))}
                      {ent.id === 'kategna-restaurant' && (
                        <span className="px-2.5 py-1 rounded-md bg-[#eceef0] text-[#3f493f] text-[11px]">
                          Free Parking
                        </span>
                      )}
                      {ent.id === 'habesha-tech' && (
                        <span className="px-2.5 py-1 rounded-md bg-[#97f8a9] text-[#00210a] text-[11px] font-semibold">
                          In-Store Pickup
                        </span>
                      )}
                      {ent.id === 'sabahar-textiles' && (
                        <span className="px-2.5 py-1 rounded-md bg-[#eceef0] text-[#3f493f] text-[11px]">
                          Workshop Tours
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (ent.id === 'habesha-tech') {
                            window.open('https://wa.me/251922884120');
                          } else {
                            window.open(`tel:${ent.phone}`);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#e7e8eb] hover:bg-[#e1e2e5] text-[#191c1e] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {ent.id === 'habesha-tech' ? 'chat' : ent.id === 'sabahar-textiles' ? 'tour' : 'call'}
                        </span>
                        <span>
                          {ent.id === 'kategna-restaurant'
                            ? 'Direct Order Line'
                            : ent.id === 'habesha-tech'
                            ? 'Procurement WhatsApp'
                            : 'Schedule Studio Tour'}
                        </span>
                      </button>
                      <button
                        onClick={() => onSelectBusiness(ent)}
                        className="px-4 py-2 rounded-xl bg-[#005f2a] text-white hover:bg-[#0f7a3a] text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {ent.specialAction?.type === 'menu'
                            ? 'menu_book'
                            : ent.specialAction?.type === 'stock'
                            ? 'inventory'
                            : 'shopping_bag'}
                        </span>
                        <span>{ent.specialAction?.label || 'View Details'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suggested For You Section Based On Local Category Browsing History */}
      <SuggestedForYouSection
        businesses={businesses}
        onSelectBusiness={onSelectBusiness}
        lang={lang}
      />

      {/* Merchant Acquisition Banner */}
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="bg-[#2e3133] text-[#eff1f3] rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#005f2a]/25 blur-3xl pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0f7a3a] text-[#a5ffb4] text-[11px] font-semibold mb-3">
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                <span>Join 2,500+ Registered Merchants</span>
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-[28px] lg:text-[32px] font-bold tracking-tight mb-3 text-[#eff1f3]">
                Operate an enterprise in Ethiopia? Accelerate with Ethio Spot.
              </h2>
              <p className="text-[16px] text-[#eff1f3]/80 leading-relaxed">
                List your business in the sovereign commercial registry. Gain verified Ministry of Trade badges, accept digital Telebirr payments directly, and reach high-intent enterprise buyers.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#97f8a9] text-[20px]">check_circle</span>
                  <span className="text-[12px] font-medium">100% Free Verified Listing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#97f8a9] text-[20px]">check_circle</span>
                  <span className="text-[12px] font-medium">Fast-Track MoT Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#97f8a9] text-[20px]">check_circle</span>
                  <span className="text-[12px] font-medium">High-Precision GPS Indexing</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto flex-shrink-0">
              <button
                onClick={() => setActiveTab('add-business')}
                className="px-8 py-3.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white font-['Plus_Jakarta_Sans'] text-[16px] font-bold transition-all text-center shadow-lg hover:shadow-[#005f2a]/30 cursor-pointer"
                type="button"
              >
                Register Your Enterprise
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className="px-8 py-3.5 rounded-xl bg-[#e1e2e5]/20 hover:bg-[#e1e2e5]/30 text-[#eff1f3] text-[14px] font-semibold transition-all text-center border border-[#e1e2e5]/30 cursor-pointer"
                type="button"
              >
                Claim Existing Listing
              </button>
            </div>
          </div>
        </div>
      </section>
      <BusinessAssistantChat businesses={businesses} onSelectBusiness={onSelectBusiness} lang={lang} />
    </div>
  );
};
