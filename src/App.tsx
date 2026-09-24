import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DiscoverView } from './components/DiscoverView';
import { CategoriesView } from './components/CategoriesView';
import { MapView } from './components/MapView';
import { AddBusinessView } from './components/AddBusinessView';
import { ClaimsView } from './components/ClaimsView';
import { AdminView } from './components/AdminView';
import { FavoritesView } from './components/FavoritesView';
import { FollowingFeedView } from './components/FollowingFeedView';
import { BusinessDetailModal } from './components/BusinessDetailModal';
import { ConciergeQuoteModal } from './components/ConciergeQuoteModal';
import { CommandSearchModal } from './components/CommandSearchModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { CompareView } from './components/CompareView';
import { PostPromotionModal } from './components/PostPromotionModal';
import { OfflineIndicator, cacheViewedBusiness } from './components/OfflineIndicator';
import { OfflineCachedModal } from './components/OfflineCachedModal';
import { UserProfileActivityModal } from './components/UserProfileActivityModal';
import { VerifyBusinessModal } from './components/VerifyBusinessModal';
import { logUserActivity } from './lib/userActivity';
import { INITIAL_BUSINESSES } from './data/businesses';
import { BusinessSpot, District, NavigationTab, QuoteRequest } from './types';
import { db, persistBusiness, persistQuote, fetchUserFavorites, addFavorite, removeFavorite, fetchPromotions, Promotion, handleFirestoreError, OperationType } from './lib/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';

function EthioSpotMain() {
  const [businesses, setBusinesses] = useState<BusinessSpot[]>(INITIAL_BUSINESSES);
  const [activeTab, setActiveTab] = useState<NavigationTab>('discover');
  const [selectedDistrict, setSelectedDistrict] = useState<District>('All Commercial Districts');
  const [lang, setLang] = useState<'EN' | 'አማ'>(() => {
    return (localStorage.getItem('ethiospot_lang') as 'EN' | 'አማ') || 'EN';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('ethiospot_dark_mode') === 'true';
  });
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('ethiospot_following_businesses');
      return raw ? JSON.parse(raw) : ['tomoca-bole'];
    } catch {
      return ['tomoca-bole'];
    }
  });
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isPostPromoModalOpen, setIsPostPromoModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ethiospot_following_businesses', JSON.stringify(followedIds));
  }, [followedIds]);

  const handleToggleFollow = (businessId: string) => {
    if (!user) {
      setNotificationMsg({
        text: 'Please sign in to follow businesses and receive updates!',
        type: 'info',
      });
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }
    setFollowedIds((prev) => {
      const exists = prev.includes(businessId);
      const updated = exists ? prev.filter((id) => id !== businessId) : [...prev, businessId];
      setNotificationMsg({
        text: exists ? 'Unfollowed business.' : 'Now following business! Updates appear in your Following feed.',
        type: 'success',
      });
      setTimeout(() => setNotificationMsg(null), 3000);
      return updated;
    });
  };

  const loadPromotions = async () => {
    try {
      const list = await fetchPromotions();
      setPromotions(list);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    localStorage.setItem('ethiospot_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('ethiospot_lang', lang);
  }, [lang]);

  // Load user favorites from Firestore
  useEffect(() => {
    if (user?.uid) {
      fetchUserFavorites(user.uid)
        .then((ids) => setFavoriteIds(ids))
        .catch(() => setFavoriteIds([]));
    } else {
      setFavoriteIds([]);
    }
  }, [user?.uid]);

  const handleToggleFavorite = async (businessId: string) => {
    if (!user) {
      setNotificationMsg({
        text: 'Please sign in with Google to save favorites.',
        type: 'info',
      });
      setTimeout(() => setNotificationMsg(null), 3500);
      return;
    }

    const isFav = favoriteIds.includes(businessId);
    if (isFav) {
      setFavoriteIds((prev) => prev.filter((id) => id !== businessId));
      try {
        await removeFavorite(user.uid, businessId);
        setNotificationMsg({
          text: 'Removed from your favorites.',
          type: 'info',
        });
      } catch (err) {
        console.warn('Remove favorite error:', err);
      }
    } else {
      setFavoriteIds((prev) => [...prev, businessId]);
      const biz = businesses.find((b) => b.id === businessId);
      logUserActivity({
        type: 'favorite',
        title: 'Saved to Favorites',
        subtitle: biz?.name || businessId,
        badgeText: 'Bookmark',
        businessId,
      });
      try {
        await addFavorite(user.uid, businessId);
        setNotificationMsg({
          text: 'Added to your favorites!',
          type: 'success',
        });
      } catch (err) {
        console.warn('Add favorite error:', err);
      }
    }
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Modal states
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSpot | null>(null);
  const [quoteBusiness, setQuoteBusiness] = useState<BusinessSpot | null | undefined>(undefined);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [activeMapSpot, setActiveMapSpot] = useState<BusinessSpot | null>(null);
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  // Notification states
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Load businesses from Cloud SQL database and synchronize
  useEffect(() => {
    const loadCloudSqlBusinesses = async () => {
      try {
        const res = await fetch('/api/businesses');
        if (res.ok) {
          const data: BusinessSpot[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBusinesses(data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch from Cloud SQL API:', err);
      }
    };

    loadCloudSqlBusinesses();

    // Attach real-time Firestore listener with mandatory error callback
    const pathForOnSnapshot = 'businesses';
    const businessesCol = collection(db, pathForOnSnapshot);

    const unsubscribe = onSnapshot(
      businessesCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: BusinessSpot[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteList.push({
              id: docSnap.id,
              name: data.name || '',
              nameAmharic: data.nameAmharic || '',
              category: data.category || 'dining',
              categoryLabel: data.categoryLabel || 'Enterprise',
              subCategory: data.subCategory || '',
              district: data.district || 'Bole Medhanialem & Atlas',
              address: data.address || '',
              addressAmharic: data.addressAmharic,
              licenseNumber: data.licenseNumber || 'MoT-Pending',
              licenseType: data.licenseType || 'MoT Verified',
              isOpen: data.isOpen ?? true,
              hours: data.hours || '8:00 AM - 9:00 PM',
              rating: Number(data.rating) || 4.8,
              reviewCount: Number(data.reviewCount) || 1,
              distanceKm: Number(data.distanceKm) || 1.0,
              priceRange: data.priceRange || '200 - 500 ETB',
              imageUrl: data.imageUrl || INITIAL_BUSINESSES[0].imageUrl,
              tags: data.tags || ['MoT Verified'],
              paymentMethods: data.paymentMethods || ['Telebirr'],
              phone: data.phone || '+251 911 000 000',
              telegram: data.telegram,
              whatsapp: data.whatsapp,
              description: data.description || '',
              lat: Number(data.lat) || 9.0,
              lng: Number(data.lng) || 38.78,
              features: data.features || ['Verified Commercial License'],
              bannerTitle: data.bannerTitle,
              specialAction: data.specialAction,
            });
          });

          const existingIds = new Set(remoteList.map((r) => r.id));
          const combined = [
            ...remoteList,
            ...INITIAL_BUSINESSES.filter((b) => !existingIds.has(b.id)),
          ];
          setBusinesses(combined);
        }
      },
      (error) => {
        console.warn('Firestore operating in offline mode or connection unavailable:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleOpenBusiness = (b: BusinessSpot) => {
    setSelectedBusiness(b);
    cacheViewedBusiness(b);
    try {
      const raw = localStorage.getItem('ethiospot_category_history');
      const history: Record<string, number> = raw ? JSON.parse(raw) : {};
      history[b.category] = (history[b.category] || 0) + 1;
      localStorage.setItem('ethiospot_category_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  };

  const handleOpenMap = (b?: BusinessSpot) => {
    if (b) {
      setActiveMapSpot(b);
      setSelectedDistrict(b.district);
    }
    setActiveTab('map-view');
  };

  const handleOpenQuote = (b?: BusinessSpot) => {
    setQuoteBusiness(b || null);
    setIsQuoteModalOpen(true);
  };

  const handleAddBusiness = async (newBusiness: BusinessSpot) => {
    // Optimistic local state update
    setBusinesses((prev) => [newBusiness, ...prev]);

    // Persist to Cloud SQL backend
    fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBusiness),
    }).catch((err) => console.warn('Cloud SQL business sync error:', err));

    // Persist to Firestore
    try {
      await persistBusiness(newBusiness);
      setNotificationMsg({
        text: `"${newBusiness.name}" registered successfully!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving business:', error);
      setNotificationMsg({
        text: `"${newBusiness.name}" registered in local session.`,
        type: 'info',
      });
    }

    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  const handleSubmitQuote = async (quote: QuoteRequest) => {
    // Persist to Cloud SQL backend
    fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    }).catch((err) => console.warn('Cloud SQL quote sync error:', err));

    try {
      await persistQuote(quote);
      logUserActivity({
        type: 'inquiry',
        title: 'Submitted B2B Quote Request',
        subtitle: `Inquiry for ${quote.category} to ${quote.businessName || 'Business'}`,
        badgeText: 'Quote Request',
        businessId: quote.businessId,
      });
      setNotificationMsg({
        text: `B2B Procurement Quote for "${quote.businessName}" submitted successfully!`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving quote:', error);
      setNotificationMsg({
        text: `B2B Quote for "${quote.businessName}" recorded.`,
        type: 'info',
      });
    }

    setTimeout(() => {
      setNotificationMsg(null);
    }, 4500);
  };

  const handleUpdateBusiness = (updated: BusinessSpot) => {
    setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    fetch(`/api/businesses/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn('Cloud SQL update error:', err));
  };

  const handleDeleteBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
    fetch(`/api/businesses/${id}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Cloud SQL delete error:', err));
  };

  return (
    <div className={`min-h-screen flex flex-col font-['Inter'] antialiased selection:bg-[#005f2a]/20 selection:text-[#005f2a] ${isDarkMode ? 'dark bg-[#121614] text-[#f1f3f2]' : 'bg-[#f8f9fc] text-[#191c1e]'}`}>
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-20 right-6 z-50 bg-[#005f2a] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 border border-[#97f8a9]/30">
          <span className="material-symbols-outlined text-[22px] text-[#97f8a9]">
            {notificationMsg.type === 'success' ? 'cloud_done' : 'info'}
          </span>
          <span className="text-[13px] font-semibold">{notificationMsg.text}</span>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-white/80 hover:text-white ml-2 text-[12px] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        lang={lang}
        setLang={setLang}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenExportPdf={() => setIsExportPdfOpen(true)}
        comparedCount={comparedIds.length}
        favoritesCount={favoriteIds.length}
        followingCount={followedIds.length}
        onOpenActivityModal={() => setIsActivityModalOpen(true)}
        onOpenVerifyModal={() => setIsVerifyModalOpen(true)}
      />

      {/* Main Tab Screen Router */}
      <main className="flex-1 flex flex-col w-full">
        {activeTab === 'discover' && (
          <DiscoverView
            businesses={businesses}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            setActiveTab={setActiveTab}
            onSelectBusiness={handleOpenBusiness}
            onRequestQuote={handleOpenQuote}
            onOpenMap={handleOpenMap}
            lang={lang}
            onOpenExportPdf={() => setIsExportPdfOpen(true)}
            promotions={promotions}
            onOpenPostModal={() => {
              if (!user) {
                setNotificationMsg({
                  text: 'Please sign in with Google to post events and promotions.',
                  type: 'info',
                });
                setTimeout(() => setNotificationMsg(null), 3500);
                return;
              }
              setIsPostPromoModalOpen(true);
            }}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            businesses={businesses}
            onSelectBusiness={handleOpenBusiness}
            onOpenMap={handleOpenMap}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            onOpenExportPdf={() => setIsExportPdfOpen(true)}
          />
        )}

        {activeTab === 'map-view' && (
          <MapView
            businesses={businesses}
            onSelectBusiness={handleOpenBusiness}
            activeSpot={activeMapSpot}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
          />
        )}

        {activeTab === 'compare' && (
          <CompareView
            businesses={businesses}
            comparedIds={comparedIds}
            onRemoveFromCompare={(id) => setComparedIds(comparedIds.filter((i) => i !== id))}
            onClearCompare={() => setComparedIds([])}
            onSelectBusiness={handleOpenBusiness}
            onRequestQuote={handleOpenQuote}
            onOpenMap={handleOpenMap}
            onNavigateDiscover={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            businesses={businesses}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectBusiness={handleOpenBusiness}
            user={user}
            onNavigateDiscover={() => setActiveTab('discover')}
            onSignInRequired={() => {
              setNotificationMsg({
                text: 'Please sign in with Google to access favorites.',
                type: 'info',
              });
              setTimeout(() => setNotificationMsg(null), 3500);
            }}
          />
        )}

        {activeTab === 'following' && (
          <FollowingFeedView
            followedIds={followedIds}
            businesses={businesses}
            promotions={promotions}
            onToggleFollow={handleToggleFollow}
            onSelectBusiness={handleOpenBusiness}
            lang={lang}
          />
        )}

        {activeTab === 'add-business' && (
          <AddBusinessView
            onAddBusiness={handleAddBusiness}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'claims' && (
          <ClaimsView businesses={businesses} />
        )}

        {activeTab === 'admin' && (
          <AdminView
            businesses={businesses}
            onUpdateBusiness={handleUpdateBusiness}
            onDeleteBusiness={handleDeleteBusiness}
            onAddBusiness={handleAddBusiness}
            onSelectBusiness={handleOpenBusiness}
            lang={lang}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Detailed Business Profile Modal */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          lang={lang}
          onClose={() => setSelectedBusiness(null)}
          onRequestQuote={handleOpenQuote}
          onOpenMap={handleOpenMap}
          isFavorite={favoriteIds.includes(selectedBusiness.id)}
          onToggleFavorite={handleToggleFavorite}
          isFollowed={followedIds.includes(selectedBusiness.id)}
          onToggleFollow={handleToggleFollow}
          onUpdateBusiness={handleUpdateBusiness}
        />
      )}

      {/* B2B Concierge Quote Modal */}
      {isQuoteModalOpen && (
        <ConciergeQuoteModal
          business={quoteBusiness}
          onClose={() => {
            setIsQuoteModalOpen(false);
            setQuoteBusiness(undefined);
          }}
          onSubmitQuote={handleSubmitQuote}
        />
      )}

      {/* Quick ⌘K Omnibox Search Modal */}
      <CommandSearchModal
        businesses={businesses}
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectBusiness={(b) => {
          setSelectedBusiness(b);
        }}
      />

      {/* Official Directory PDF Export Modal */}
      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        businesses={businesses}
        activeDistrict={selectedDistrict}
        onSuccessToast={(msg) =>
          setNotificationMsg({
            text: msg,
            type: 'success',
          })
        }
      />

      {/* Post Promotion Modal */}
      <PostPromotionModal
        isOpen={isPostPromoModalOpen}
        onClose={() => setIsPostPromoModalOpen(false)}
        businesses={businesses}
        onPromotionCreated={() => {
          loadPromotions();
          setNotificationMsg({
            text: 'Promotion successfully posted!',
            type: 'success',
          });
          setTimeout(() => setNotificationMsg(null), 3000);
        }}
      />

      {/* Offline Indicator & Cached Profiles */}
      <OfflineIndicator onOpenCachedModal={() => setIsOfflineModalOpen(true)} />
      <OfflineCachedModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onSelectBusiness={(b) => setSelectedBusiness(b)}
      />

      {/* User Profile Recent Activity Modal */}
      <UserProfileActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        userName={user?.displayName || 'Merchant Agent'}
        userEmail={user?.email || 'user@ethiospot.et'}
      />

      {/* Verify My Business Modal */}
      <VerifyBusinessModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        businesses={businesses}
        userName={user?.displayName || 'Merchant Agent'}
        userEmail={user?.email || 'user@ethiospot.et'}
      />

      {/* Persistent Floating Language Toggle */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center bg-white/95 backdrop-blur-md border border-[#005f2a]/20 rounded-full shadow-2xl p-1.5 transition-all hover:scale-105">
        <button
          type="button"
          onClick={() => {
            const nextLang = lang === 'EN' ? 'አማ' : 'EN';
            setLang(nextLang);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#005f2a] text-white text-[13px] font-bold shadow-md transition-all hover:bg-[#0f7a3a] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">translate</span>
          <span>{lang === 'EN' ? 'አማርኛ (Amharic)' : 'English (EN)'}</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EthioSpotMain />
    </AuthProvider>
  );
}
