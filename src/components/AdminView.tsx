import React, { useState, useEffect, useMemo } from 'react';
import { BusinessSpot, CategoryId, District, ClaimRequest, QuoteRequest } from '../types';
import { DIRECTORY_CATEGORIES } from '../data/businesses';
import {
  persistBusiness,
  updateBusinessDoc,
  deleteBusinessDoc,
  persistClaim,
  updateClaimDoc,
  deleteClaimDoc,
  updateQuoteDoc,
  deleteQuoteDoc,
  db,
} from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface AdminViewProps {
  businesses: BusinessSpot[];
  onUpdateBusiness: (updated: BusinessSpot) => void;
  onDeleteBusiness: (id: string) => void;
  onAddBusiness: (b: BusinessSpot) => void;
  onSelectBusiness: (b: BusinessSpot) => void;
  lang: 'EN' | 'አማ';
}

export const AdminView: React.FC<AdminViewProps> = ({
  businesses,
  onUpdateBusiness,
  onDeleteBusiness,
  onAddBusiness,
  onSelectBusiness,
  lang,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'businesses' | 'claims' | 'quotes' | 'tools'>('businesses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>('all');

  // Modal states
  const [editingBusiness, setEditingBusiness] = useState<BusinessSpot | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Claims & Quotes in-memory and synced states
  const [claimsList, setClaimsList] = useState<ClaimRequest[]>([
    {
      id: 'claim-1',
      businessName: 'Tomoca Coffee Roasters — Flagship Bole Branch',
      licenseNumber: 'MoT-00441928',
      tinNumber: '0039281726',
      applicantName: 'Dawit Hailu',
      role: 'Operations Director',
      applicantPhone: '+251 911 234 567',
      status: 'Approved',
      submittedAt: 'Yesterday, 4:15 PM',
    },
    {
      id: 'claim-2',
      businessName: 'Bethzatha Emergency Clinic & 24/7 Pharmacy',
      licenseNumber: 'EFDA-HL-883912',
      tinNumber: '0081290341',
      applicantName: 'Dr. Selamawit Tadesse',
      role: 'Chief Medical Officer',
      applicantPhone: '+251 115 514 141',
      status: 'Under MoT Verification',
      submittedAt: 'Today, 10:30 AM',
    },
    {
      id: 'claim-3',
      businessName: 'Habesha Tech & Laptops Hub',
      licenseNumber: 'MoT-889104',
      tinNumber: '0041289945',
      applicantName: 'Ermias Bekele',
      role: 'Hardware Lead & Partner',
      applicantPhone: '+251 922 334 455',
      status: 'Reviewing',
      submittedAt: '2 days ago',
    },
  ]);

  const [quotesList, setQuotesList] = useState<QuoteRequest[]>([
    {
      id: 'quote-1',
      businessName: 'Habesha Tech & Laptops',
      category: 'tech',
      contactName: 'Yared Getachew',
      organization: 'Addis FinTech Solutions PLC',
      phone: '+251 911 887 766',
      email: 'procurement@addisfintech.et',
      urgency: 'Immediate (24-48h)',
      quantityNotes: 'Requesting quotation for 15x ThinkPad T14 Gen 4 and 20x 27" IPS Monitors with MoT VAT receipts.',
      status: 'Under Evaluation',
      submittedAt: 'Today, 09:15 AM',
    },
    {
      id: 'quote-2',
      businessName: 'Tomoca Coffee Roasters',
      category: 'coffee',
      contactName: 'Marta Alemayehu',
      organization: 'Skyline Hospitality Group',
      phone: '+251 933 445 566',
      email: 'marta@skylineaddis.com',
      urgency: 'Bulk / Tender',
      quantityNotes: 'Monthly standing order of 80kg roasted Yirgacheffe and Sidama beans for hotel chain branches in Bole and Kazanchis.',
      status: 'Forwarded to Merchant',
      submittedAt: 'Yesterday, 02:40 PM',
    },
  ]);

  // Activity Log
  const [activityLogs, setActivityLogs] = useState<Array<{ id: string; action: string; time: string; type: 'success' | 'warn' | 'info' }>>([
    { id: '1', action: 'MoT Verified license sync completed for Bole corridor', time: '10 mins ago', type: 'info' },
    { id: '2', action: 'Approved ownership claim for Tomoca Coffee (Dawit Hailu)', time: 'Yesterday', type: 'success' },
  ]);

  const triggerToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const addActivity = (action: string, type: 'success' | 'warn' | 'info' = 'info') => {
    const newLog = {
      id: String(Date.now()),
      action,
      time: 'Just now',
      type,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // Sync real-time claims from Firestore when available
  useEffect(() => {
    const claimsCol = collection(db, 'claims');
    const unsub = onSnapshot(
      claimsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteClaims: ClaimRequest[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            remoteClaims.push({
              id: d.id,
              businessName: data.businessName || 'Business',
              licenseNumber: data.licenseNumber || '',
              tinNumber: data.tinNumber || '',
              applicantName: data.applicantName || '',
              role: data.role || '',
              applicantPhone: data.applicantPhone || '',
              status: data.status || 'Under MoT Verification',
              submittedAt: data.submittedAt || 'Recent',
            });
          });
          // Merge with initial list
          setClaimsList((prev) => {
            const ids = new Set(remoteClaims.map((c) => c.id));
            const remaining = prev.filter((p) => p.id && !ids.has(p.id));
            return [...remoteClaims, ...remaining];
          });
        }
      },
      (err) => {
        console.warn('Firestore claims live sync notice (offline fallback active):', err);
      }
    );
    return () => unsub();
  }, []);

  // Sync real-time quotes from Firestore when available
  useEffect(() => {
    const quotesCol = collection(db, 'quotes');
    const unsub = onSnapshot(
      quotesCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteQuotes: QuoteRequest[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            remoteQuotes.push({
              id: d.id,
              businessId: data.businessId,
              businessName: data.businessName || 'Enterprise',
              category: data.category || 'procurement',
              contactName: data.contactName || '',
              organization: data.organization || 'Organization',
              phone: data.phone || '',
              email: data.email || '',
              urgency: data.urgency || 'Standard (1-2 weeks)',
              quantityNotes: data.quantityNotes || '',
              status: data.status || 'Under Evaluation',
              submittedAt: data.submittedAt || 'Recent',
            });
          });
          setQuotesList((prev) => {
            const ids = new Set(remoteQuotes.map((q) => q.id));
            const remaining = prev.filter((p) => p.id && !ids.has(p.id));
            return [...remoteQuotes, ...remaining];
          });
        }
      },
      (err) => {
        console.warn('Firestore quotes live sync notice (offline fallback active):', err);
      }
    );
    return () => unsub();
  }, []);

  // Filtered Businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        b.name.toLowerCase().includes(q) ||
        (b.nameAmharic && b.nameAmharic.toLowerCase().includes(q)) ||
        b.licenseNumber.toLowerCase().includes(q) ||
        b.district.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesDistrict = selectedDistrict === 'all' || b.district === selectedDistrict;
      const matchesLicense = selectedLicenseType === 'all' || b.licenseType === selectedLicenseType;

      return matchesQuery && matchesCategory && matchesDistrict && matchesLicense;
    });
  }, [businesses, searchQuery, selectedCategory, selectedDistrict, selectedLicenseType]);

  // Quick stats
  const stats = useMemo(() => {
    const total = businesses.length;
    const verified = businesses.filter((b) => b.licenseType === 'MoT Verified' || b.licenseType === 'Fair Trade & MoT').length;
    const openNow = businesses.filter((b) => b.isOpen).length;
    const pendingClaims = claimsList.filter((c) => c.status === 'Under MoT Verification' || c.status === 'Reviewing').length;
    const activeQuotes = quotesList.filter((q) => q.status === 'Under Evaluation').length;
    const telebirrCount = businesses.filter((b) => b.paymentMethods.includes('Telebirr') || b.paymentMethods.includes('Telebirr SuperApp')).length;
    const verifiedRate = total > 0 ? Math.round((verified / total) * 100) : 0;

    return { total, verified, openNow, pendingClaims, activeQuotes, telebirrCount, verifiedRate };
  }, [businesses, claimsList, quotesList]);

  // Actions
  const handleToggleVerification = async (b: BusinessSpot) => {
    const isNowVerified = b.licenseType !== 'MoT Verified';
    const updated: BusinessSpot = {
      ...b,
      licenseType: isNowVerified ? 'MoT Verified' : 'Pending Verification',
      tags: isNowVerified
        ? Array.from(new Set([...b.tags, 'MoT Verified']))
        : b.tags.filter((t) => t !== 'MoT Verified'),
    };
    onUpdateBusiness(updated);
    await updateBusinessDoc(b.id, {
      licenseType: updated.licenseType,
      tags: updated.tags,
    });
    triggerToast(
      isNowVerified
        ? `Fast-Tracked: ${b.name} is now MoT Verified ✓`
        : `Verification revoked for ${b.name}`
    );
    addActivity(`Updated MoT verification status for ${b.name} (${updated.licenseType})`, 'success');
  };

  const handleToggleOpen = async (b: BusinessSpot) => {
    const updated: BusinessSpot = {
      ...b,
      isOpen: !b.isOpen,
    };
    onUpdateBusiness(updated);
    await updateBusinessDoc(b.id, { isOpen: updated.isOpen });
    triggerToast(`${b.name} marked as ${updated.isOpen ? 'Open Now' : 'Closed'}`);
    addActivity(`Toggled operating status for ${b.name} (${updated.isOpen ? 'Open' : 'Closed'})`, 'info');
  };

  const handleDeleteBusinessConfirmed = async () => {
    if (!deleteConfirmId) return;
    const target = businesses.find((b) => b.id === deleteConfirmId);
    onDeleteBusiness(deleteConfirmId);
    await deleteBusinessDoc(deleteConfirmId);
    setDeleteConfirmId(null);
    triggerToast(`De-listed: ${target?.name || 'Enterprise'} removed from directory`);
    addActivity(`De-listed enterprise ${target?.name || deleteConfirmId}`, 'warn');
  };

  const handleClaimStatusChange = async (claim: ClaimRequest, newStatus: 'Under MoT Verification' | 'Approved' | 'Reviewing') => {
    const updatedClaims = claimsList.map((c) =>
      (c.id && c.id === claim.id) || c.licenseNumber === claim.licenseNumber ? { ...c, status: newStatus } : c
    );
    setClaimsList(updatedClaims);

    if (claim.id) {
      await updateClaimDoc(claim.id, { status: newStatus });
    }

    // If approved, also upgrade the business to 'MoT Verified' automatically
    if (newStatus === 'Approved') {
      const match = businesses.find(
        (b) => b.name.toLowerCase().trim() === claim.businessName.toLowerCase().trim() || b.licenseNumber === claim.licenseNumber
      );
      if (match) {
        const updatedBiz: BusinessSpot = {
          ...match,
          licenseType: 'MoT Verified',
          tags: Array.from(new Set([...match.tags, 'MoT Verified', 'Owner Verified'])),
        };
        onUpdateBusiness(updatedBiz);
        await updateBusinessDoc(match.id, {
          licenseType: 'MoT Verified',
          tags: updatedBiz.tags,
        });
      }
      triggerToast(`Ownership Approved: ${claim.applicantName} confirmed for ${claim.businessName}`);
      addActivity(`Approved ownership claim for ${claim.businessName} (Applicant: ${claim.applicantName})`, 'success');
    } else {
      triggerToast(`Claim updated to "${newStatus}" for ${claim.businessName}`);
      addActivity(`Set claim status to ${newStatus} for ${claim.businessName}`, 'info');
    }
  };

  const handleDeleteClaim = async (claimId: string) => {
    setClaimsList((prev) => prev.filter((c) => c.id !== claimId));
    await deleteClaimDoc(claimId);
    triggerToast('Claim entry deleted from moderation queue');
    addActivity(`Removed claim item ${claimId}`, 'warn');
  };

  const handleQuoteStatusChange = async (quoteId: string, status: string) => {
    setQuotesList((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status } : q)));
    await updateQuoteDoc(quoteId, { status });
    triggerToast(`Quote status updated to: ${status}`);
    addActivity(`Updated B2B Quote #${quoteId} status to ${status}`, 'info');
  };

  const handleDeleteQuote = async (quoteId: string) => {
    setQuotesList((prev) => prev.filter((q) => q.id !== quoteId));
    await deleteQuoteDoc(quoteId);
    triggerToast('Quote inquiry removed');
    addActivity(`Deleted quote inquiry #${quoteId}`, 'warn');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(businesses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EthioSpot_Directory_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported complete directory database as JSON');
    addActivity('Exported directory data as JSON backup', 'info');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Amharic Name', 'Category', 'District', 'License Number', 'License Type', 'Rating', 'Phone', 'Price Range'];
    const rows = businesses.map((b) => [
      `"${b.id}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${(b.nameAmharic || '').replace(/"/g, '""')}"`,
      `"${b.category}"`,
      `"${b.district}"`,
      `"${b.licenseNumber}"`,
      `"${b.licenseType}"`,
      b.rating,
      `"${b.phone}"`,
      `"${b.priceRange}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `EthioSpot_Businesses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported businesses catalog as CSV');
    addActivity('Exported businesses catalog as CSV spreadsheet', 'info');
  };

  const handleBatchVerifyAll = async () => {
    let count = 0;
    for (const b of businesses) {
      if (b.licenseType !== 'MoT Verified') {
        const updated: BusinessSpot = {
          ...b,
          licenseType: 'MoT Verified',
          tags: Array.from(new Set([...b.tags, 'MoT Verified'])),
        };
        onUpdateBusiness(updated);
        updateBusinessDoc(b.id, { licenseType: 'MoT Verified', tags: updated.tags });
        count++;
      }
    }
    triggerToast(`Batch audit finished: ${count} enterprise(s) upgraded to MoT Verified ✓`);
    addActivity(`Ran batch MoT verification sync: certified ${count} enterprises`, 'success');
  };

  const labels = {
    EN: {
      title: 'EthioSpot Central Administration',
      subtitle: 'Ministry of Trade Registry Operations & Enterprise Verification Portal',
      tabBiz: 'Enterprise Registry',
      tabClaims: 'Ownership Claims',
      tabQuotes: 'B2B Quotes',
      tabTools: 'Registry Tools',
      addBizBtn: '+ Register Enterprise',
      searchPlaceholder: 'Search name, license, district, tags...',
    },
    'አማ': {
      title: 'የኢትዮ ስፖት ማዕከላዊ አስተዳደር',
      subtitle: 'የንግድና ቀጣናዊ ትስስር ሚኒስቴር የንግድ ምዝገባና ማረጋገጫ ፖርታል',
      tabBiz: 'የተመዘገቡ ንግዶች',
      tabClaims: 'የባለቤትነት ይገባኛል',
      tabQuotes: 'የጥቅስ ጥያቄዎች',
      tabTools: 'የስርዓት ቁጥጥር',
      addBizBtn: '+ አዲስ ንግድ መዝግብ',
      searchPlaceholder: 'ስም፣ የፈቃድ ቁጥር፣ ሰፈር ይፈልጉ...',
    },
  }[lang];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#005f2a] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#97f8a9]/30 animate-in slide-in-from-bottom-4 duration-150">
          <span className="material-symbols-outlined text-[#97f8a9] text-[22px]">check_circle</span>
          <span className="text-[13px] font-semibold">{actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg(null)} className="ml-2 text-white/80 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-br from-[#005f2a] via-[#0f7a3a] to-[#003916] rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-[#97f8a9]/20">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#97f8a9] uppercase tracking-wider border border-white/15">
              <span className="w-2 h-2 rounded-full bg-[#97f8a9] animate-pulse" />
              <span>MoT Regulatory Hub • SuperAdmin Console</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-[26px] lg:text-[34px] font-extrabold tracking-tight leading-tight">
              {labels.title}
            </h1>
            <p className="text-[14px] text-white/85 leading-relaxed">
              {labels.subtitle} — Real-time governance over licensed spots, ownership validation, and procurement flows across Addis Ababa corridors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f9bd00] hover:bg-[#e0aa00] text-black font-bold text-[13px] transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_business</span>
              <span>{labels.addBizBtn}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[13px] transition-all cursor-pointer"
              title="Download full JSON registry backup"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Real-Time Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Total Registry</span>
            <div className="text-[22px] font-black text-white mt-0.5">{stats.total}</div>
            <span className="text-[10px] text-[#97f8a9] font-medium">Licensed spots</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">MoT Verified</span>
            <div className="text-[22px] font-black text-[#97f8a9] mt-0.5">{stats.verified}</div>
            <span className="text-[10px] text-white/70 font-medium">{stats.verifiedRate}% accredited</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Open Spots</span>
            <div className="text-[22px] font-black text-white mt-0.5">{stats.openNow}</div>
            <span className="text-[10px] text-[#97f8a9] font-medium">Active right now</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Pending Claims</span>
            <div className="text-[22px] font-black text-[#f9bd00] mt-0.5">{stats.pendingClaims}</div>
            <span className="text-[10px] text-white/70 font-medium">Ownership queue</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">B2B Quotes</span>
            <div className="text-[22px] font-black text-white mt-0.5">{stats.activeQuotes}</div>
            <span className="text-[10px] text-white/70 font-medium">Inbound leads</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Telebirr Nodes</span>
            <div className="text-[22px] font-black text-[#7bdb8f] mt-0.5">{stats.telebirrCount}</div>
            <span className="text-[10px] text-white/70 font-medium">QR settlement ready</span>
          </div>
        </div>
      </div>

      {/* Main Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#eceef0] dark:border-[#27332c] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('businesses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'businesses'
              ? 'bg-[#005f2a] text-white shadow-sm'
              : 'text-[#3f493f] dark:text-[#9ea7a1] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          <span>{labels.tabBiz} ({filteredBusinesses.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'claims'
              ? 'bg-[#005f2a] text-white shadow-sm'
              : 'text-[#3f493f] dark:text-[#9ea7a1] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>{labels.tabClaims}</span>
          {stats.pendingClaims > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#f9bd00] text-black text-[11px] font-bold flex items-center justify-center">
              {stats.pendingClaims}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'quotes'
              ? 'bg-[#005f2a] text-white shadow-sm'
              : 'text-[#3f493f] dark:text-[#9ea7a1] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">request_quote</span>
          <span>{labels.tabQuotes}</span>
          {stats.activeQuotes > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#005f2a] text-white text-[11px] font-bold flex items-center justify-center">
              {stats.activeQuotes}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('tools')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'tools'
              ? 'bg-[#005f2a] text-white shadow-sm'
              : 'text-[#3f493f] dark:text-[#9ea7a1] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          <span>{labels.tabTools}</span>
        </button>
      </div>

      {/* TAB 1: ENTERPRISE DIRECTORY REGISTRY */}
      {activeAdminTab === 'businesses' && (
        <div className="space-y-5">
          {/* Filtering Controls */}
          <div className="bg-white dark:bg-[#161c19] p-4 rounded-2xl border border-[#eceef0] dark:border-[#28342e] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 bg-[#f8f9fc] dark:bg-[#1c2420] px-3.5 py-2 rounded-xl border border-[#eceef0] dark:border-[#28342e]">
              <span className="material-symbols-outlined text-[#3f493f] dark:text-[#9ea7a1] text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={labels.searchPlaceholder}
                className="w-full bg-transparent text-[13px] text-[#191c1e] dark:text-white placeholder:text-[#6f7a6e] outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-xs text-[#6f7a6e] hover:text-black dark:hover:text-white">
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] text-[#191c1e] dark:text-white text-[12px] font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {DIRECTORY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedLicenseType}
                onChange={(e) => setSelectedLicenseType(e.target.value)}
                className="bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] text-[#191c1e] dark:text-white text-[12px] font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                <option value="all">All License Tiers</option>
                <option value="MoT Verified">MoT Verified Only</option>
                <option value="EFDA Licensed">EFDA Healthcare</option>
                <option value="Fair Trade & MoT">Fair Trade & MoT</option>
                <option value="Pending Verification">Pending Verification</option>
              </select>

              <button
                onClick={handleBatchVerifyAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#005f2a]/10 hover:bg-[#005f2a]/20 text-[#005f2a] dark:text-[#97f8a9] text-[12px] font-bold border border-[#005f2a]/20 transition-colors cursor-pointer"
                title="Automatically verify all unverified spots in the registry"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Fast-Track All MoT</span>
              </button>
            </div>
          </div>

          {/* Directory Listings Table / Cards */}
          <div className="bg-white dark:bg-[#161c19] rounded-3xl border border-[#eceef0] dark:border-[#28342e] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fc] dark:bg-[#1c2420] text-[#6f7a6e] dark:text-[#9ea7a1] text-[11px] font-bold uppercase tracking-wider border-b border-[#eceef0] dark:border-[#28342e]">
                    <th className="py-3 px-4">Enterprise & License</th>
                    <th className="py-3 px-4">District & Category</th>
                    <th className="py-3 px-4">Status & Hours</th>
                    <th className="py-3 px-4">Contact & Payment</th>
                    <th className="py-3 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0] dark:divide-[#28342e]">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-[#f8f9fc] dark:hover:bg-[#1c2420]/60 transition-colors">
                      {/* Enterprise & License */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.imageUrl}
                            alt={b.name}
                            className="w-11 h-11 rounded-xl object-cover border border-[#eceef0] dark:border-[#28342e] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#191c1e] dark:text-white truncate max-w-[240px]">
                              {b.name}
                            </p>
                            {b.nameAmharic && (
                              <p className="text-[11px] text-[#6f7a6e] dark:text-[#9ea7a1] truncate">{b.nameAmharic}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[11px] text-[#005f2a] dark:text-[#97f8a9] font-semibold">
                                {b.licenseNumber}
                              </span>
                              <button
                                onClick={() => handleToggleVerification(b)}
                                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md cursor-pointer transition-colors ${
                                  b.licenseType === 'MoT Verified' || b.licenseType === 'Fair Trade & MoT'
                                    ? 'bg-[#97f8a9]/40 text-[#005f2a] dark:text-[#97f8a9]'
                                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                                }`}
                                title="Click to toggle verification status"
                              >
                                <span className="material-symbols-outlined text-[11px]">
                                  {b.licenseType === 'MoT Verified' ? 'verified' : 'pending'}
                                </span>
                                {b.licenseType}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* District & Category */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#191c1e] dark:text-white">{b.district.split('&')[0]}</p>
                        <p className="text-[11px] text-[#6f7a6e] dark:text-[#9ea7a1]">{b.categoryLabel || b.category}</p>
                        <span className="text-[10px] text-[#6f7a6e] dark:text-[#9ea7a1]">{b.priceRange}</span>
                      </td>

                      {/* Status & Hours */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleOpen(b)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            b.isOpen
                              ? 'bg-[#97f8a9]/40 text-[#005f2a] dark:text-[#97f8a9]'
                              : 'bg-[#eceef0] dark:bg-[#28342e] text-[#6f7a6e]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${b.isOpen ? 'bg-[#005f2a] dark:bg-[#97f8a9]' : 'bg-[#6f7a6e]'}`} />
                          {b.isOpen ? 'Open Now' : 'Closed'}
                        </button>
                        <p className="text-[11px] text-[#6f7a6e] dark:text-[#9ea7a1] mt-0.5">{b.hours}</p>
                        <div className="flex items-center gap-1 text-[11px] text-[#fdc002] mt-0.5">
                          <span>★ {b.rating}</span>
                          <span className="text-[#6f7a6e]">({b.reviewCount})</span>
                        </div>
                      </td>

                      {/* Contact & Payment */}
                      <td className="py-3.5 px-4">
                        <p className="font-mono text-[12px] text-[#191c1e] dark:text-white">{b.phone}</p>
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          {b.paymentMethods.map((p) => (
                            <span
                              key={p}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-[#f2f4f6] dark:bg-[#1c2420] text-[#3f493f] dark:text-[#9ea7a1] font-semibold"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Administrative Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectBusiness(b)}
                            className="p-1.5 text-[#3f493f] dark:text-[#9ea7a1] hover:text-[#005f2a] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420] rounded-lg transition-colors cursor-pointer"
                            title="Preview public profile"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            onClick={() => setEditingBusiness(b)}
                            className="p-1.5 text-[#3f493f] dark:text-[#9ea7a1] hover:text-[#005f2a] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420] rounded-lg transition-colors cursor-pointer"
                            title="Edit enterprise attributes"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(b.id)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
                            title="De-list business"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBusinesses.length === 0 && (
                <div className="p-12 text-center space-y-2">
                  <span className="material-symbols-outlined text-[42px] text-[#6f7a6e]">search_off</span>
                  <p className="text-[15px] font-bold text-[#191c1e] dark:text-white">No businesses match query</p>
                  <p className="text-[12px] text-[#6f7a6e]">Try changing the district, category, or clear search filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OWNERSHIP CLAIMS DESK */}
      {activeAdminTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-[#191c1e] dark:text-white">
                Commercial Enterprise Ownership Verification Queue
              </h2>
              <p className="text-[13px] text-[#6f7a6e] dark:text-[#9ea7a1]">
                Review credentials, MoT Tax Identification Numbers (TIN), and legal authorization from merchants claiming profile control.
              </p>
            </div>
            <span className="text-[12px] font-bold text-[#005f2a] dark:text-[#97f8a9] bg-[#97f8a9]/20 px-3 py-1 rounded-full">
              {claimsList.length} Total Submissions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {claimsList.map((c, idx) => (
              <div
                key={c.id || idx}
                className="bg-white dark:bg-[#161c19] rounded-2xl p-5 border border-[#eceef0] dark:border-[#28342e] shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        c.status === 'Approved'
                          ? 'bg-[#97f8a9]/40 text-[#005f2a] dark:text-[#97f8a9]'
                          : c.status === 'Reviewing'
                          ? 'bg-[#ffdf9d]/50 text-[#785a00]'
                          : 'bg-[#ba1a1a]/15 text-[#ba1a1a]'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-[11px] text-[#6f7a6e] dark:text-[#9ea7a1]">{c.submittedAt}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[14px] text-[#191c1e] dark:text-white leading-tight">
                      {c.businessName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="font-mono text-[#005f2a] dark:text-[#97f8a9] font-bold">TIN: {c.tinNumber}</span>
                      <span className="text-[#6f7a6e]">•</span>
                      <span className="text-[#6f7a6e]">{c.licenseNumber}</span>
                    </div>
                  </div>

                  <div className="bg-[#f8f9fc] dark:bg-[#1c2420] p-3 rounded-xl space-y-1 text-[12px]">
                    <div className="flex justify-between">
                      <span className="text-[#6f7a6e]">Applicant:</span>
                      <span className="font-bold text-[#191c1e] dark:text-white">{c.applicantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6f7a6e]">Role:</span>
                      <span className="font-medium text-[#191c1e] dark:text-white">{c.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6f7a6e]">Phone:</span>
                      <a href={`tel:${c.applicantPhone}`} className="font-mono text-[#005f2a] dark:text-[#97f8a9] font-semibold underline">
                        {c.applicantPhone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#eceef0] dark:border-[#28342e] flex items-center gap-2">
                  {c.status !== 'Approved' ? (
                    <button
                      onClick={() => handleClaimStatusChange(c, 'Approved')}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#005f2a] hover:bg-[#004b20] text-white text-[12px] font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Approve Ownership ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => handleClaimStatusChange(c, 'Under MoT Verification')}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#f2f4f6] dark:bg-[#1c2420] text-[#3f493f] dark:text-[#9ea7a1] text-[12px] font-semibold transition-all cursor-pointer"
                    >
                      Re-open Review
                    </button>
                  )}

                  {c.id && (
                    <button
                      onClick={() => handleDeleteClaim(c.id!)}
                      className="p-2 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                      title="Delete claim record"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: B2B PROCUREMENT QUOTES */}
      {activeAdminTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-[#191c1e] dark:text-white">
                B2B Procurement & Concierge Quote Inquiries
              </h2>
              <p className="text-[13px] text-[#6f7a6e] dark:text-[#9ea7a1]">
                Institutional, bulk trade, and commercial quote requests submitted through the EthioSpot B2B Concierge desk.
              </p>
            </div>
            <span className="text-[12px] font-bold text-[#005f2a] dark:text-[#97f8a9] bg-[#97f8a9]/20 px-3 py-1 rounded-full">
              {quotesList.length} Inquiries
            </span>
          </div>

          <div className="space-y-3">
            {quotesList.map((q) => (
              <div
                key={q.id}
                className="bg-white dark:bg-[#161c19] rounded-2xl p-5 border border-[#eceef0] dark:border-[#28342e] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-[#005f2a]/10 text-[#005f2a] dark:text-[#97f8a9] px-2 py-0.5 rounded-md">
                      {q.urgency}
                    </span>
                    <span className="text-[11px] text-[#6f7a6e] dark:text-[#9ea7a1]">{q.submittedAt}</span>
                    <span className="text-[11px] font-semibold text-[#f9bd00] bg-[#f9bd00]/15 px-2 py-0.5 rounded">
                      Status: {q.status || 'Under Evaluation'}
                    </span>
                  </div>

                  <h3 className="font-bold text-[15px] text-[#191c1e] dark:text-white">
                    {q.organization} • {q.contactName}
                  </h3>
                  <p className="text-[13px] text-[#3f493f] dark:text-[#d0d7d2] leading-relaxed">
                    {q.quantityNotes}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#6f7a6e] dark:text-[#9ea7a1] pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      <a href={`tel:${q.phone}`} className="hover:underline">{q.phone}</a>
                    </span>
                    {q.email && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">mail</span>
                        <a href={`mailto:${q.email}`} className="hover:underline">{q.email}</a>
                      </span>
                    )}
                    {q.businessName && (
                      <span className="flex items-center gap-1 text-[#005f2a] dark:text-[#97f8a9] font-medium">
                        Target: {q.businessName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={q.status || 'Under Evaluation'}
                    onChange={(e) => q.id && handleQuoteStatusChange(q.id, e.target.value)}
                    className="bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] text-[12px] font-semibold px-3 py-2 rounded-xl text-[#191c1e] dark:text-white outline-none cursor-pointer"
                  >
                    <option value="Under Evaluation">Under Evaluation</option>
                    <option value="Forwarded to Merchant">Forwarded to Merchant</option>
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Archived">Archived</option>
                  </select>

                  {q.id && (
                    <button
                      onClick={() => handleDeleteQuote(q.id!)}
                      className="p-2 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors cursor-pointer"
                      title="Delete quote"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REGISTRY TOOLS & AUDIT */}
      {activeAdminTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#161c19] rounded-3xl p-6 border border-[#eceef0] dark:border-[#28342e] shadow-sm space-y-4">
              <h3 className="font-bold text-[16px] text-[#191c1e] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005f2a] text-[20px]">database</span>
                Database & Export Operations
              </h3>
              <p className="text-[13px] text-[#6f7a6e] dark:text-[#9ea7a1]">
                Execute automated audits, export structured spreadsheets, and manage persistence synchronizations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#f8f9fc] dark:bg-[#1c2420] hover:bg-[#eceef0] dark:hover:bg-[#232d28] border border-[#eceef0] dark:border-[#28342e] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#005f2a] text-[24px]">data_object</span>
                  <div>
                    <p className="font-bold text-[13px] text-[#191c1e] dark:text-white">Download JSON</p>
                    <p className="text-[11px] text-[#6f7a6e]">Full structured directory</p>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#f8f9fc] dark:bg-[#1c2420] hover:bg-[#eceef0] dark:hover:bg-[#232d28] border border-[#eceef0] dark:border-[#28342e] text-left transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#005f2a] text-[24px]">csv</span>
                  <div>
                    <p className="font-bold text-[13px] text-[#191c1e] dark:text-white">Export CSV</p>
                    <p className="text-[11px] text-[#6f7a6e]">Spreadsheet compatible</p>
                  </div>
                </button>
              </div>

              <div className="pt-3 border-t border-[#eceef0] dark:border-[#28342e] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[13px] text-[#191c1e] dark:text-white">Batch MoT Accreditation</p>
                  <p className="text-[11px] text-[#6f7a6e]">Cross-reference and verify all unverified spots</p>
                </div>
                <button
                  onClick={handleBatchVerifyAll}
                  className="px-4 py-2.5 rounded-xl bg-[#005f2a] hover:bg-[#004b20] text-white text-[12px] font-bold transition-all shadow-sm cursor-pointer"
                >
                  Execute Batch Verification
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#161c19] rounded-3xl p-6 border border-[#eceef0] dark:border-[#28342e] shadow-sm space-y-3">
              <h3 className="font-bold text-[15px] text-[#191c1e] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005f2a] text-[20px]">history</span>
                Live Audit Ledger
              </h3>
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] text-[12px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#6f7a6e] font-semibold">
                      <span className="uppercase">{log.type}</span>
                      <span>{log.time}</span>
                    </div>
                    <p className="text-[#191c1e] dark:text-white font-medium">{log.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BUSINESS */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161c19] w-full max-w-2xl rounded-3xl p-6 lg:p-8 shadow-2xl border border-[#eceef0] dark:border-[#28342e] space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#eceef0] dark:border-[#28342e] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005f2a] text-[22px]">edit</span>
                <h3 className="font-bold text-[18px] text-[#191c1e] dark:text-white">
                  Edit Commercial Listing
                </h3>
              </div>
              <button
                onClick={() => setEditingBusiness(null)}
                className="text-[#6f7a6e] hover:text-black dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateBusiness(editingBusiness);
                updateBusinessDoc(editingBusiness.id, editingBusiness);
                setEditingBusiness(null);
                triggerToast(`Saved changes for ${editingBusiness.name}`);
                addActivity(`Modified enterprise attributes for ${editingBusiness.name}`, 'info');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Enterprise Name (EN)</label>
                  <input
                    type="text"
                    value={editingBusiness.name}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                    className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Amharic Name (የንግድ ስም)</label>
                  <input
                    type="text"
                    value={editingBusiness.nameAmharic || ''}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, name: editingBusiness.name, nameAmharic: e.target.value })}
                    className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">District</label>
                  <input
                    type="text"
                    value={editingBusiness.district}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, district: e.target.value as District })}
                    className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">MoT License No.</label>
                  <input
                    type="text"
                    value={editingBusiness.licenseNumber}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, licenseNumber: e.target.value })}
                    className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">License Tier</label>
                  <select
                    value={editingBusiness.licenseType}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, licenseType: e.target.value as any })}
                    className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
                  >
                    <option value="MoT Verified">MoT Verified</option>
                    <option value="EFDA Licensed">EFDA Licensed</option>
                    <option value="Fair Trade & MoT">Fair Trade & MoT</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingBusiness.phone}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, phone: e.target.value })}
                    className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Hours</label>
                  <input
                    type="text"
                    value={editingBusiness.hours}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, hours: e.target.value })}
                    className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={editingBusiness.address}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, address: e.target.value })}
                  className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingBusiness.description}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, description: e.target.value })}
                  className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl p-3 text-[13px] text-[#191c1e] dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eceef0] dark:border-[#28342e]">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="px-4 py-2 rounded-xl text-[#3f493f] dark:text-[#9ea7a1] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420] text-[13px] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#005f2a] hover:bg-[#004b20] text-white text-[13px] font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BUSINESS DIRECTLY FROM ADMIN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#161c19] w-full max-w-2xl rounded-3xl p-6 lg:p-8 shadow-2xl border border-[#eceef0] dark:border-[#28342e] space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#eceef0] dark:border-[#28342e] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005f2a] text-[22px]">add_business</span>
                <h3 className="font-bold text-[18px] text-[#191c1e] dark:text-white">
                  Add Enterprise to Registry
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6f7a6e] hover:text-black dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <AdminNewEnterpriseForm
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={(newSpot) => {
                onAddBusiness(newSpot);
                persistBusiness(newSpot);
                setIsAddModalOpen(false);
                triggerToast(`Enterprise Registered: ${newSpot.name} added to directory`);
                addActivity(`Registered new enterprise ${newSpot.name} (${newSpot.licenseNumber})`, 'success');
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161c19] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-[#eceef0] dark:border-[#28342e] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">warning</span>
            </div>
            <h3 className="font-bold text-[17px] text-[#191c1e] dark:text-white">
              De-list Enterprise Record?
            </h3>
            <p className="text-[13px] text-[#6f7a6e] dark:text-[#9ea7a1] leading-relaxed">
              This action will remove the listing from public commercial corridors. You can re-register or restore from backup anytime.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-[#3f493f] dark:text-[#9ea7a1] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420] text-[13px] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBusinessConfirmed}
                className="px-5 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[13px] font-bold transition-all shadow-sm cursor-pointer"
              >
                Confirm De-list
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent for Admin Quick Add
interface AdminNewEnterpriseFormProps {
  onClose: () => void;
  onSubmit: (b: BusinessSpot) => void;
}

const AdminNewEnterpriseForm: React.FC<AdminNewEnterpriseFormProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [nameAmharic, setNameAmharic] = useState('');
  const [category, setCategory] = useState<CategoryId>('dining');
  const [district, setDistrict] = useState<District>('Bole Medhanialem & Atlas');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [address, setAddress] = useState('');
  const [priceRange, setPriceRange] = useState('250 - 600 ETB');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catObj = DIRECTORY_CATEGORIES.find((c) => c.id === category);

    const newSpot: BusinessSpot = {
      id: `biz-${Date.now()}`,
      name: name.trim() || 'New Enterprise',
      nameAmharic: nameAmharic.trim() || 'አዲስ የተመዘገበ ንግድ',
      category,
      categoryLabel: catObj?.name || 'Commercial Enterprise',
      subCategory: `${catObj?.name || 'Enterprise'} • ${district.split('&')[0]}`,
      district,
      address: address.trim() || 'Addis Ababa, Ethiopia',
      licenseNumber: licenseNumber.trim() || `MoT-${Math.floor(100000 + Math.random() * 900000)}`,
      licenseType: 'MoT Verified',
      isOpen: true,
      hours: '8:00 AM - 9:00 PM',
      rating: 5.0,
      reviewCount: 1,
      distanceKm: 0.8,
      priceRange: priceRange || '200 - 500 ETB',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDWiagvlIK1XA7mwFba7tJSVTmyNbQHwdfPNd-fToLVzMXKkMRpECuS72P1Gmq6b7TOfTJTx7loxaSCGgwMvtNeq0sHkbY0JKa2bgkBqVxWgelP_ldEYCE4O8r29HIJQpGgWdcuXA5LFnecny6VXZZHxoujnpMY8QL_0fJ-2bxGIR3d5K8LYOtDBBuD6_kKFRXL2p61W1NDpRLWumBgVG3i5mpm1-8YzIeWBmOZ3ZEmmK2u6ulpM96P',
      tags: ['MoT Verified', 'Accredited Merchant'],
      paymentMethods: ['Telebirr', 'CBE Birr'],
      phone: phone || '+251 911 000 000',
      description: description || 'Ministry of Trade certified commercial provider in Addis Ababa.',
      lat: 8.995 + Math.random() * 0.03,
      lng: 38.78 + Math.random() * 0.03,
      features: ['MoT Verified Commercial License', 'Telebirr QR Instant Settlement'],
    };

    onSubmit(newSpot);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Trade Name (English) *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Abyssinia Agro Exporters"
            className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Amharic Name (የንግድ ስም)</label>
          <input
            type="text"
            value={nameAmharic}
            onChange={(e) => setNameAmharic(e.target.value)}
            placeholder="e.g. አቢሲኒያ የግብርና ኤክስፖርት"
            className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryId)}
            className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none cursor-pointer"
          >
            {DIRECTORY_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Commercial Corridor</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value as District)}
            className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none cursor-pointer"
          >
            <option value="Bole Medhanialem & Atlas">Bole Medhanialem & Atlas</option>
            <option value="Kazanchis & UNECA Area">Kazanchis & UNECA Area</option>
            <option value="Megenagna & CMC">Megenagna & CMC</option>
            <option value="Piazza & Arat Kilo">Piazza & Arat Kilo</option>
            <option value="Sarbet & Bisrate Gabriel">Sarbet & Bisrate Gabriel</option>
            <option value="Mercato & Kirkos">Mercato & Kirkos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">MoT License No.</label>
          <input
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="MoT-992810"
            className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Pricing Guide</label>
          <input
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Physical Address / Landmark Guidance</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. Africa Avenue, In front of Edna Mall, Addis Ababa"
          className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl px-3 py-2 text-[13px] text-[#191c1e] dark:text-white outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-[#6f7a6e] mb-1">Commercial Description</label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Offerings, wholesale capabilities, warranty, and special trade terms..."
          className="w-full bg-[#f8f9fc] dark:bg-[#1c2420] border border-[#eceef0] dark:border-[#28342e] rounded-xl p-3 text-[13px] text-[#191c1e] dark:text-white outline-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eceef0] dark:border-[#28342e]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-[#3f493f] dark:text-[#9ea7a1] hover:bg-[#f2f4f6] dark:hover:bg-[#1c2420] text-[13px] font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-[#005f2a] hover:bg-[#004b20] text-white text-[13px] font-bold transition-all shadow-sm cursor-pointer"
        >
          Add to Registry ✓
        </button>
      </div>
    </form>
  );
};
