import React, { useState } from 'react';
import { NavigationTab, District } from '../types';
import { USER_AVATAR_IMAGE } from '../data/businesses';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedDistrict: District;
  setSelectedDistrict: (district: District) => void;
  lang: 'EN' | 'አማ';
  setLang: (l: 'EN' | 'አማ') => void;
  onOpenSearch: () => void;
  unreadCount?: number;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  onOpenExportPdf?: () => void;
  comparedCount?: number;
  favoritesCount?: number;
  followingCount?: number;
  onOpenActivityModal?: () => void;
  onOpenVerifyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedDistrict,
  setSelectedDistrict,
  lang,
  setLang,
  onOpenSearch,
  unreadCount = 2,
  isDarkMode = false,
  setIsDarkMode,
  onOpenExportPdf,
  comparedCount = 0,
  favoritesCount = 0,
  followingCount = 0,
  onOpenActivityModal,
  onOpenVerifyModal,
}) => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const { user, signIn, signOutUser } = useAuth();

  const districts: District[] = [
    'All Commercial Districts',
    'Bole Medhanialem & Atlas',
    'Kazanchis & UNECA Area',
    'Megenagna & CMC',
    'Piazza & Arat Kilo',
    'Sarbet & Bisrate Gabriel',
    'Mercato & Kirkos',
  ];

  const navLabels = {
    EN: {
      discover: 'Discover',
      categories: 'Categories',
      mapView: 'Map View',
      compare: 'Compare',
      favorites: 'Favorites',
      following: 'Following',
      addBusiness: 'Add Business',
      claims: 'Claims',
      admin: 'Admin',
      subCity: 'Addis Ababa, Bole',
      searchPlaceholder: 'Search registered businesses, trade categories, or license types...',
    },
    'አማ': {
      discover: 'አስስ',
      categories: 'ምድቦች',
      mapView: 'የካርታ እይታ',
      compare: 'ማወዳደር',
      favorites: 'ተወዳጆች',
      following: 'የሚከተሏቸው',
      addBusiness: 'ንግድ ይመዝግቡ',
      claims: 'የይገባኛል ጥያቄ',
      admin: 'አስተዳደር',
      subCity: 'አዲስ አበባ፣ ቦሌ',
      searchPlaceholder: 'የተመዘገቡ ንግዶችን፣ የንግድ ምድቦችን ወይም የፈቃድ ቁጥሮችን ይፈልጉ...',
    },
  }[lang];

  return (
    <header className="sticky top-0 z-50 bg-[#ffffff]/90 backdrop-blur-xl border-b border-[#eceef0] shadow-[0_1px_10px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-7xl mx-auto h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand & Location Hub */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            aria-label="EthioSpot Home - Discover View"
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <BrandLogo />
          </button>

          {/* Location Dropdown Pill */}
          <div className="relative hidden xl:block">
            <button
              type="button"
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              aria-label="Select commercial district location"
              aria-expanded={showLocationMenu}
              aria-controls="location-dropdown-menu"
              className="flex items-center gap-1.5 bg-[#f2f4f6] hover:bg-[#eceef0] px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-[#e7e8eb]/60"
            >
              <span className="material-symbols-outlined text-[#005f2a] text-[18px]">location_on</span>
              <span className="text-[12px] text-[#191c1e] font-semibold">
                {selectedDistrict === 'All Commercial Districts' ? 'Addis Ababa, Bole' : selectedDistrict.split('&')[0]}
              </span>
              <span className="material-symbols-outlined text-[#3f493f] text-[16px]">expand_more</span>
            </button>

            {showLocationMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#eceef0] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-[11px] font-bold text-[#6f7a6e] uppercase tracking-wider">
                  Select Commercial Corridor
                </div>
                {districts.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSelectedDistrict(d);
                      setShowLocationMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-[13px] flex items-center justify-between transition-colors ${
                      selectedDistrict === d
                        ? 'bg-[#97f8a9]/30 text-[#005f2a] font-bold'
                        : 'hover:bg-[#f2f4f6] text-[#191c1e]'
                    }`}
                  >
                    <span>{d}</span>
                    {selectedDistrict === d && (
                      <span className="material-symbols-outlined text-[16px] text-[#005f2a]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Search Bar Shortcut */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center bg-[#f2f4f6] hover:bg-[#eceef0] rounded-full px-3.5 py-1.5 gap-2 cursor-pointer transition-all border border-[#eceef0] text-left"
          >
            <span className="material-symbols-outlined text-[#3f493f] text-[18px]">search</span>
            <span className="text-[12px] text-[#3f493f] flex-1 truncate">
              {navLabels.searchPlaceholder}
            </span>
            <kbd className="hidden lg:inline-flex text-[10px] bg-[#e1e2e5] text-[#3f493f] px-1.5 py-0.5 rounded font-medium">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="hidden lg:flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`transition-colors py-1 text-[14px] font-semibold relative ${
              activeTab === 'discover'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            {navLabels.discover}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`transition-colors py-1 text-[14px] font-semibold relative ${
              activeTab === 'categories'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            {navLabels.categories}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map-view')}
            className={`transition-colors py-1 text-[14px] font-semibold relative ${
              activeTab === 'map-view'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            {navLabels.mapView}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`transition-colors py-1 text-[14px] font-semibold relative flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
            <span>{navLabels.compare}</span>
            {comparedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#005f2a] text-white text-[10px] font-bold">
                {comparedCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`transition-colors py-1 text-[14px] font-semibold relative flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-rose-500 font-variation-settings-filled">favorite</span>
            <span>{navLabels.favorites}</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`transition-colors py-1 text-[14px] font-semibold relative flex items-center gap-1.5 ${
              activeTab === 'following'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#005f2a]">rss_feed</span>
            <span>{navLabels.following}</span>
            {followingCount !== undefined && followingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#005f2a] text-white text-[10px] font-bold">
                {followingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add-business')}
            className={`transition-colors py-1 text-[14px] font-semibold relative ${
              activeTab === 'add-business'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            {navLabels.addBusiness}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`transition-colors py-1 text-[14px] font-semibold relative ${
              activeTab === 'claims'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            {navLabels.claims}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`transition-colors py-1 text-[14px] font-semibold relative flex items-center gap-1 ${
              activeTab === 'admin'
                ? 'text-[#005f2a] font-["Plus_Jakarta_Sans"] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#005f2a] after:rounded-full'
                : 'text-[#3f493f] hover:text-[#191c1e]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>{navLabels.admin}</span>
          </button>
        </nav>

        {/* Right Utility Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher lang={lang} setLang={setLang} />

          {/* Dark Mode Toggle */}
          {setIsDarkMode && (
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full text-[#3f493f] hover:bg-[#e7e8eb] transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}

          {/* Export PDF Button */}
          {onOpenExportPdf && (
            <button
              type="button"
              onClick={onOpenExportPdf}
              title="Export Directory to PDF for offline printing & sharing"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#005f2a]/10 hover:bg-[#005f2a]/20 text-[#005f2a] text-[12px] font-semibold transition-colors cursor-pointer border border-[#005f2a]/20"
            >
              <span className="material-symbols-outlined text-[17px]">picture_as_pdf</span>
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          )}

          {/* Search Trigger for Mobile */}
          <button
            aria-label="Search"
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-full text-[#3f493f] hover:bg-[#f2f4f6]"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-[#3f493f] hover:bg-[#f2f4f6] hover:text-[#191c1e] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#eceef0] p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#eceef0]">
                  <span className="text-[12px] font-bold text-[#191c1e]">Notifications</span>
                  <span className="text-[10px] bg-[#97f8a9]/40 text-[#005f2a] px-2 py-0.5 rounded-full font-bold">
                    MoT Verified Live
                  </span>
                </div>
                <div className="py-2 space-y-2 text-[12px]">
                  <div className="p-2 rounded-xl bg-[#f2f4f6] flex gap-2">
                    <span className="material-symbols-outlined text-[#005f2a] text-[18px]">verified</span>
                    <div>
                      <p className="font-semibold text-[#191c1e]">New Registry MoT Sync</p>
                      <p className="text-[#3f493f] text-[11px]">850+ enterprises successfully verified for Q3 trade.</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#f2f4f6] flex gap-2">
                    <span className="material-symbols-outlined text-[#fdc002] text-[18px]">currency_exchange</span>
                    <div>
                      <p className="font-semibold text-[#191c1e]">Telebirr SuperApp Online</p>
                      <p className="text-[#3f493f] text-[11px]">QR direct procurement enabled for all Bole branches.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Firebase Authentication & User Profile */}
          <div className="relative">
            {user ? (
              <button
                type="button"
                onClick={() => setShowAuthMenu(!showAuthMenu)}
                className="flex items-center gap-2 pl-1 cursor-pointer group focus:outline-none"
                title={user.displayName || user.email || 'Authenticated User'}
              >
                {user.photoURL ? (
                  <img
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#005f2a]/40 group-hover:ring-[#005f2a] transition-all"
                    src={user.photoURL}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#005f2a] text-white flex items-center justify-center text-[12px] font-bold ring-2 ring-[#005f2a]/20">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline-block text-[12px] font-medium text-[#191c1e] max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <span className="material-symbols-outlined text-[#3f493f] text-[16px]">expand_more</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signIn()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#005f2a] hover:bg-[#004b20] text-white text-[12px] font-semibold transition-all shadow-sm shadow-[#005f2a]/20 cursor-pointer"
                title="Sign in with Google via Firebase"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887C18.2 16.55 15.64 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.665 0 3.105.615 4.23 1.62l3.075-3.075C17.655 2.85 15.135 2 12.24 2 6.705 2 2.25 6.45 2.25 12s4.455 10 9.99 10c5.79 0 9.63-4.065 9.63-9.81 0-.66-.06-1.305-.18-1.905H12.24z" />
                </svg>
                <span>Sign In</span>
              </button>
            )}

            {/* Auth Dropdown Menu */}
            {showAuthMenu && user && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#eceef0] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 p-2 bg-[#f8f9fa] rounded-xl border border-[#eceef0]/60">
                  {user.photoURL ? (
                    <img
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#005f2a]/20"
                      src={user.photoURL}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#005f2a] text-white flex items-center justify-center font-bold">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[13px] text-[#191c1e] truncate">
                      {user.displayName || 'Merchant Agent'}
                    </p>
                    <p className="text-[11px] text-[#596259] truncate">{user.email}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#005f2a] bg-[#97f8a9]/30 px-1.5 py-0.5 rounded-md mt-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      Firebase Verified
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#eceef0] space-y-1">
                  <div className="px-2 py-1.5 text-[11px] text-[#596259] flex items-center justify-between">
                    <span>Cloud Database</span>
                    <span className="font-semibold text-[#005f2a]">Firestore Online</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthMenu(false);
                      onOpenActivityModal?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#191c1e] hover:bg-[#eceef0]/60 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#005f2a]">history</span>
                    Recent Activity History
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthMenu(false);
                      onOpenVerifyModal?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#005f2a] hover:bg-[#005f2a]/10 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Verify My Business
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthMenu(false);
                      setActiveTab('admin');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#005f2a] hover:bg-[#005f2a]/10 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                    {lang === 'EN' ? 'Open Admin Console' : 'የአስተዳዳሪ ገጽ ክፈት'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthMenu(false);
                      signOutUser();
                    }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-[#eceef0] px-2 py-1.5 bg-white overflow-x-auto">
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold shrink-0 ${
            activeTab === 'discover' ? 'text-[#005f2a] bg-[#97f8a9]/30' : 'text-[#3f493f]'
          }`}
        >
          {navLabels.discover}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold shrink-0 ${
            activeTab === 'categories' ? 'text-[#005f2a] bg-[#97f8a9]/30' : 'text-[#3f493f]'
          }`}
        >
          {navLabels.categories}
        </button>
        <button
          onClick={() => setActiveTab('map-view')}
          className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold shrink-0 ${
            activeTab === 'map-view' ? 'text-[#005f2a] bg-[#97f8a9]/30' : 'text-[#3f493f]'
          }`}
        >
          {navLabels.mapView}
        </button>
        <button
          onClick={() => setActiveTab('add-business')}
          className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold shrink-0 ${
            activeTab === 'add-business' ? 'text-[#005f2a] bg-[#97f8a9]/30' : 'text-[#3f493f]'
          }`}
        >
          {navLabels.addBusiness}
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold shrink-0 ${
            activeTab === 'claims' ? 'text-[#005f2a] bg-[#97f8a9]/30' : 'text-[#3f493f]'
          }`}
        >
          {navLabels.claims}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold shrink-0 flex items-center gap-0.5 ${
            activeTab === 'admin' ? 'text-[#005f2a] bg-[#97f8a9]/30' : 'text-[#3f493f]'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">shield</span>
          {navLabels.admin}
        </button>
      </div>
    </header>
  );
};
