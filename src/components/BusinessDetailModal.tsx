import React, { useState, useEffect } from 'react';
import { BusinessSpot } from '../types';
import { downloadSingleBusinessPdf } from '../lib/pdfGenerator';
import { ReviewTrendMiniDashboard } from './ReviewTrendMiniDashboard';
import { BusinessReviewsTab } from './BusinessReviewsTab';
import { ReportDataModal } from './ReportDataModal';
import { BusinessChatTab } from './BusinessChatTab';
import { getAccessibilityScore, ACCESSIBILITY_OPTIONS } from '../lib/accessibility';
import { submitExpertInquiry } from '../lib/firebase';
import QRCode from 'qrcode';

interface BusinessDetailModalProps {
  business: BusinessSpot | null;
  lang?: 'EN' | 'አማ';
  onClose: () => void;
  onRequestQuote: (b: BusinessSpot) => void;
  onOpenMap: (b: BusinessSpot) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (businessId: string) => void;
  isFollowed?: boolean;
  onToggleFollow?: (businessId: string) => void;
  onUpdateBusiness?: (b: BusinessSpot) => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  lang = 'EN',
  onClose,
  onRequestQuote,
  onOpenMap,
  isFavorite = false,
  onToggleFavorite,
  isFollowed = false,
  onToggleFollow,
  onUpdateBusiness,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'reviews' | 'catalog' | 'accreditation' | 'messages' | 'faq' | 'accessibility' | 'expert'>('overview');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [notified, setNotified] = useState(false);
  const [currentRating, setCurrentRating] = useState(business?.rating || 4.7);
  const [currentReviewCount, setCurrentReviewCount] = useState(business?.reviewCount || 0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const businessDeepLink = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}#business=${business?.id}` 
    : `https://ethiospot.et/business/${business?.id}`;

  useEffect(() => {
    if (business && isQrModalOpen) {
      QRCode.toDataURL(businessDeepLink, {
        width: 280,
        margin: 2,
        color: {
          dark: '#005f2a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [business?.id, isQrModalOpen, businessDeepLink]);

  const handleCopyDeepLink = () => {
    navigator.clipboard?.writeText(businessDeepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    if (business?.galleryImages && business.galleryImages.length > 0) {
      return business.galleryImages;
    }
    const fallbackMap: Record<string, string[]> = {
      dining: [
        business?.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      ],
      coffee: [
        business?.imageUrl || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
      ],
      tech: [
        business?.imageUrl || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      ],
      wellness: [
        business?.imageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512290900672-8a9d18b3905a?auto=format&fit=crop&w=800&q=80',
      ],
      hotels: [
        business?.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      ],
    };
    const cat = business?.category || 'dining';
    return fallbackMap[cat] || [
      business?.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    ];
  });

  useEffect(() => {
    if (business?.galleryImages && business.galleryImages.length > 0) {
      setGalleryImages(business.galleryImages);
    } else if (business) {
      const fallbackMap: Record<string, string[]> = {
        dining: [
          business.imageUrl,
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        ],
        coffee: [
          business.imageUrl,
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
        ],
        tech: [
          business.imageUrl,
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
        ],
        wellness: [
          business.imageUrl,
          'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1512290900672-8a9d18b3905a?auto=format&fit=crop&w=800&q=80',
        ],
        hotels: [
          business.imageUrl,
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        ],
      };
      const cat = business.category;
      setGalleryImages(fallbackMap[cat] || [
        business.imageUrl,
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
      ]);
    }
  }, [business?.id]);

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isAddingPhotoModal, setIsAddingPhotoModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !business) return;
    const updated = [newPhotoUrl.trim(), ...galleryImages];
    setGalleryImages(updated);
    business.galleryImages = updated;
    if (onUpdateBusiness) onUpdateBusiness(business);
    setNewPhotoUrl('');
    setIsAddingPhotoModal(false);
  };

  const [expertName, setExpertName] = useState('');
  const [expertEmail, setExpertEmail] = useState('');
  const [expertDept, setExpertDept] = useState<'Licensing & Compliance' | 'Product & Pricing' | 'Bulk Orders & Logistics' | 'General Inquiry'>('Licensing & Compliance');
  const [expertQuestion, setExpertQuestion] = useState('');
  const [expertSubmitting, setExpertSubmitting] = useState(false);
  const [expertSuccess, setExpertSuccess] = useState(false);

  const handleAskExpertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !expertName.trim() || !expertQuestion.trim()) return;
    setExpertSubmitting(true);
    try {
      await submitExpertInquiry({
        businessId: business.id,
        businessName: business.name,
        userName: expertName.trim(),
        userEmail: expertEmail.trim() || undefined,
        question: expertQuestion.trim(),
        department: expertDept,
      });
      setExpertSuccess(true);
      setExpertQuestion('');
      setTimeout(() => setExpertSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to submit expert inquiry:', err);
    } finally {
      setExpertSubmitting(false);
    }
  };

  const [isOpenStatus, setIsOpenStatus] = useState<boolean>(business?.isOpen ?? true);
  const [closingHoursInput, setClosingHoursInput] = useState<string>(business?.hours || '7:00 AM - 10:00 PM');

  useEffect(() => {
    if (business) {
      setIsOpenStatus(business.isOpen);
      setClosingHoursInput(business.hours);
    }
  }, [business?.id]);

  const [accessibilityFeatures, setAccessibilityFeatures] = useState<string[]>(() => {
    return business?.accessibilityFeatures || ['Wheelchair Access', 'Dedicated Accessible Parking'];
  });

  useEffect(() => {
    if (business?.accessibilityFeatures) {
      setAccessibilityFeatures(business.accessibilityFeatures);
    } else {
      setAccessibilityFeatures(['Wheelchair Access', 'Dedicated Accessible Parking']);
    }
  }, [business?.id]);

  const handleToggleAccessibilityFeature = (opt: string) => {
    if (!business) return;
    const updated = accessibilityFeatures.includes(opt)
      ? accessibilityFeatures.filter((f) => f !== opt)
      : [...accessibilityFeatures, opt];
    setAccessibilityFeatures(updated);
    business.accessibilityFeatures = updated;
  };

  const accessData = business
    ? getAccessibilityScore({ ...business, accessibilityFeatures })
    : { score: 85, grade: 'A', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', matchedFeatures: [] };

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(() => {
    if (business?.faqs && business.faqs.length > 0) return business.faqs;
    return [
      { question: 'Do you have customer parking available?', answer: 'Yes, secure off-street parking is available for visitors and clients.' },
      { question: 'Do you accept international cards or mobile transfers?', answer: `We accept ${business?.paymentMethods?.join(', ') || 'Telebirr, CBE Birr'} for all purchases.` },
      { question: 'What are your standard opening hours?', answer: business?.hours || 'Mon-Sat 8am - 8pm' },
      { question: 'Do you offer bulk wholesale pricing or B2B contracts?', answer: 'Yes, bulk inquiries and institutional B2B procurement quotes are fully supported.' }
    ];
  });
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  useEffect(() => {
    if (business?.faqs && business.faqs.length > 0) {
      setFaqs(business.faqs);
    } else if (business) {
      setFaqs([
        { question: 'Do you have customer parking available?', answer: 'Yes, secure off-street parking is available for visitors and clients.' },
        { question: 'Do you accept international cards or mobile transfers?', answer: `We accept ${business.paymentMethods.join(', ')} for all purchases.` },
        { question: 'What are your standard opening hours?', answer: business.hours },
        { question: 'Do you offer bulk wholesale pricing or B2B contracts?', answer: 'Yes, bulk inquiries and institutional B2B procurement quotes are fully supported.' }
      ]);
    }
  }, [business?.id]);

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim() || !business) return;
    const updated = [...faqs, { question: newQuestion.trim(), answer: newAnswer.trim() }];
    setFaqs(updated);
    business.faqs = updated;
    setNewQuestion('');
    setNewAnswer('');
    setIsAddingFaq(false);
  };

  useEffect(() => {
    setNotified(false);
  }, [business?.id]);

  const handleCopyAddress = () => {
    if (!business) return;
    navigator.clipboard?.writeText(`${business.address}${business.addressAmharic ? ` (${business.addressAmharic})` : ''}`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleShare = async () => {
    if (!business) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business.name} (${business.nameAmharic}) - EthioSpot`,
          text: `Check out ${business.name} in ${business.district}, Addis Ababa. Verified MoT merchant on EthioSpot.`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Business link copied to clipboard!');
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (business) {
      setCurrentRating(business.rating);
      setCurrentReviewCount(business.reviewCount);
    }
  }, [business]);

  if (!business) return null;

  const images = React.useMemo(() => {
    if (business?.galleryImages && business.galleryImages.length > 0) {
      return [business.imageUrl, ...business.galleryImages.filter((img) => img !== business.imageUrl)];
    }
    return [
      business.imageUrl,
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&q=80&w=800',
    ];
  }, [business]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [business?.id]);

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(business.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#eceef0] relative flex flex-col">
        {/* Header Image with Badges & Horizontal Gallery Strip */}
        <div className="relative h-76 w-full bg-[#eceef0] overflow-hidden flex-shrink-0">
          <img
            src={images[activeImageIndex]}
            alt={business.name}
            className="w-full h-full object-cover transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Photo Count Badge */}
          <div className="absolute bottom-20 right-4 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">photo_library</span>
            <span>{activeImageIndex + 1} / {images.length} photos</span>
          </div>

          {/* Horizontal Scrollable Thumbnail Strip */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-14 h-11 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'border-[#005f2a] scale-105 shadow-md' : 'border-white/60 opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>

          {/* Top Right Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onToggleFavorite && business && (
              <button
                onClick={() => onToggleFavorite(business.id)}
                title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                className={`w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer ${
                  isFavorite ? 'text-rose-500' : 'text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isFavorite ? 'font-variation-settings-filled' : ''}`}>
                  favorite
                </span>
              </button>
            )}
            {onToggleFollow && business && (
              <button
                onClick={() => onToggleFollow(business.id)}
                title={isFollowed ? 'Unfollow business' : 'Follow business for updates'}
                className={`px-3 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFollowed ? 'bg-[#005f2a]/90 text-white border border-emerald-400/50' : ''
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isFollowed ? 'rss_feed' : 'add'}
                </span>
                <span>{isFollowed ? 'Following' : 'Follow'}</span>
              </button>
            )}
            <button
              onClick={() => setIsQrModalOpen(true)}
              title="Share via QR Code"
              className="px-3 h-9 rounded-full bg-[#005f2a] hover:bg-[#0a7a38] text-white text-[12px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>QR Code</span>
            </button>
            <button
              onClick={handleShare}
              title="Share business profile"
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Verification Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
            <span className="bg-white/95 backdrop-blur-md text-[#191c1e] px-3 py-1 rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[#005f2a] text-[16px]">verified</span>
              <span>{business.licenseType}</span>
            </span>
            <span className={`backdrop-blur-md px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-sm text-white ${
              business.isOpen ? 'bg-[#005f2a]' : 'bg-rose-900/90'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-ping ${business.isOpen ? 'bg-emerald-300' : 'bg-rose-300'}`}></span>
              <span>{business.isOpen ? 'Open Now' : 'Closed'}</span>
            </span>
            <button
              onClick={() => setActiveTab('accessibility')}
              className="bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 backdrop-blur-md px-3 py-1 rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">accessible</span>
              <span>Accessibility: {accessData.score}%</span>
            </button>
          </div>

          {/* Business Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[12px] font-medium tracking-wide text-[#97f8a9] block mb-1">
              {business.subCategory}
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] text-[22px] md:text-[26px] font-bold leading-tight">
              {business.name}
            </h2>
            <p className="text-[13px] text-white/80 font-ethiopic mt-0.5">
              {business.nameAmharic}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Rating, Price & Hours Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#f2f4f6] border border-[#eceef0]">
            <div className="flex items-center gap-3">
              <div className="flex items-center text-[#fdc002]">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-[16px] text-[#191c1e] font-bold ml-1">{currentRating}</span>
              </div>
              <span className="text-[13px] text-[#3f493f]">({currentReviewCount} verified local reviews)</span>
              <button
                type="button"
                onClick={() => setActiveTab('trends')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#005f2a]/10 hover:bg-[#005f2a]/20 text-[#005f2a] text-[11px] font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>6-Mo Trend</span>
              </button>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase font-bold text-[#6f7a6e] block">Pricing / Terms</span>
              <span className="text-[15px] font-bold text-[#005f2a]">{business.priceRange}</span>
            </div>
          </div>

          {/* Tabs */}
          <div role="tablist" aria-label="Business Profile Sections" className="flex border-b border-[#eceef0] gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            <button
              role="tab"
              aria-selected={activeTab === 'overview'}
              aria-label="Overview and Details tab"
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              Overview & Details
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'trends'}
              aria-label="6-Month Review Trend tab"
              onClick={() => setActiveTab('trends')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trends'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">monitoring</span>
              <span>Review Trend (6-Mo)</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'reviews'}
              aria-label="Community Reviews tab"
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">rate_review</span>
              <span>Community Reviews</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'catalog'}
              aria-label="Offerings and Specifications tab"
              onClick={() => setActiveTab('catalog')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              Offerings & Specs
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'accreditation'}
              aria-label="Accreditation and License tab"
              onClick={() => setActiveTab('accreditation')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'accreditation'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              Accreditation & License
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'messages'}
              aria-label="Direct Inquiry Chat tab"
              onClick={() => setActiveTab('messages')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'messages'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Direct Inquiry Chat</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'faq'}
              aria-label="FAQ and Inquiries tab"
              onClick={() => setActiveTab('faq')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'faq'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">help</span>
              <span>FAQ & Inquiries</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'accessibility'}
              aria-label="Accessibility and Inclusion tab"
              onClick={() => setActiveTab('accessibility')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'accessibility'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">accessible</span>
              <span>Accessibility ({accessData.score}%)</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'expert'}
              aria-label="Ask an Expert tab"
              onClick={() => setActiveTab('expert')}
              className={`pb-2.5 text-[13px] sm:text-[14px] font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'expert'
                  ? 'border-[#005f2a] text-[#005f2a]'
                  : 'border-transparent text-[#3f493f] hover:text-[#191c1e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Ask an Expert</span>
            </button>
          </div>

          {/* Tab Content: Ask an Expert */}
          {activeTab === 'expert' && (
            <div className="py-6 space-y-6 animate-in fade-in">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#005f2a] text-white flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[22px]">psychology</span>
                  </div>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-[#191c1e]">
                      Direct Expert Consultation & Inquiry
                    </h3>
                    <p className="text-[13px] text-[#3f493f]">
                      Submit a professional question to {business.name}&apos;s verified specialists. Stored securely in Firestore as a pending inquiry for business admin response.
                    </p>
                  </div>
                </div>
              </div>

              {expertSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-[#005f2a]">check_circle</span>
                  <h4 className="font-bold text-[16px]">Inquiry Successfully Submitted!</h4>
                  <p className="text-[13px]">
                    Your question has been routed to the {business.name} expert desk and recorded in Firestore. You will receive a response soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAskExpertSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-[#eceef0] shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-bold text-[#191c1e] mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ato Dawit Kebede"
                        value={expertName}
                        onChange={(e) => setExpertName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#dce0e5] text-[13px] focus:outline-none focus:border-[#005f2a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#191c1e] mb-1">Email / Contact (Optional)</label>
                      <input
                        type="email"
                        placeholder="dawit@enterprise.et"
                        value={expertEmail}
                        onChange={(e) => setExpertEmail(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#dce0e5] text-[13px] focus:outline-none focus:border-[#005f2a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#191c1e] mb-1">Inquiry Department / Topic *</label>
                    <select
                      value={expertDept}
                      onChange={(e) => setExpertDept(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#dce0e5] text-[13px] focus:outline-none focus:border-[#005f2a] bg-white"
                    >
                      <option value="Licensing & Compliance">Licensing & Ministry of Trade Compliance</option>
                      <option value="Product & Pricing">Product Specifications & Pricing</option>
                      <option value="Bulk Orders & Logistics">Bulk Orders & B2B Logistics</option>
                      <option value="General Inquiry">General Business Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#191c1e] mb-1">Your Question or Consultation Request *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Ask about product availability, wholesale terms, compliance documents, or custom service requests..."
                      value={expertQuestion}
                      onChange={(e) => setExpertQuestion(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#dce0e5] text-[13px] focus:outline-none focus:border-[#005f2a]"
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={expertSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[14px] font-bold shadow-md cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>{expertSubmitting ? 'Saving to Firestore...' : 'Submit Expert Inquiry'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab Content: Accessibility & Inclusion */}
          {activeTab === 'accessibility' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#005f2a] text-white flex flex-col items-center justify-center font-['Plus_Jakarta_Sans'] font-extrabold shadow-md">
                    <span className="text-[20px]">{accessData.score}%</span>
                    <span className="text-[10px] tracking-wider uppercase opacity-90">Grade {accessData.grade}</span>
                  </div>
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-[#191c1e]">
                      Accessibility Infrastructure Score
                    </h3>
                    <p className="text-[13px] text-[#3f493f] mt-0.5">
                      Evaluated based on reported features like wheelchair access, braille signage, and dedicated parking.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold border ${accessData.badgeColor} inline-flex items-center gap-1`}>
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Inclusive Enterprise Rating</span>
                  </span>
                </div>
              </div>

              {/* Owner Infrastructure Manager */}
              <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#eceef0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#191c1e]">
                      Business Owner Infrastructure Checklist
                    </h4>
                    <p className="text-[12px] text-[#6f7a6e]">
                      Toggle features to update your accessible infrastructure score and attract diverse clientele.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#005f2a] bg-[#005f2a]/10 px-2.5 py-1 rounded-lg">
                    Owner Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {ACCESSIBILITY_OPTIONS.map((opt) => {
                    const isChecked = accessibilityFeatures.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleAccessibilityFeature(opt)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#005f2a]/5 border-[#005f2a] text-[#191c1e] font-semibold'
                            : 'bg-white border-[#eceef0] text-[#6f7a6e] hover:border-gray-300'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 text-[13px]">
                          <span className={`material-symbols-outlined text-[18px] ${isChecked ? 'text-[#005f2a]' : 'text-gray-400'}`}>
                            {isChecked ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span>{opt}</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${isChecked ? 'bg-[#005f2a] text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {isChecked ? '+20%' : 'Add'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-[#191c1e]">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-[12px] text-[#6f7a6e]">
                    Pre-defined common inquiries managed by {business.name} to reduce redundant questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingFaq(!isAddingFaq)}
                  className="px-3 py-1.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isAddingFaq ? 'close' : 'add'}
                  </span>
                  <span>{isAddingFaq ? 'Cancel' : 'Add FAQ (Owner)'}</span>
                </button>
              </div>

              {/* Add FAQ Form */}
              {isAddingFaq && (
                <form onSubmit={handleAddFaq} className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#eceef0] space-y-3 animate-in fade-in">
                  <h4 className="text-[13px] font-bold text-[#191c1e]">Pre-define a Common Question</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6f7a6e] mb-1">Question</label>
                    <input
                      type="text"
                      placeholder="e.g., Do you offer home delivery in Bole?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#eceef0] text-[13px] text-[#191c1e] focus:outline-none focus:border-[#005f2a]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6f7a6e] mb-1">Answer</label>
                    <textarea
                      rows={2}
                      placeholder="Provide clear details or conditions..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#eceef0] text-[13px] text-[#191c1e] focus:outline-none focus:border-[#005f2a]"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[12px] font-bold transition-all cursor-pointer"
                    >
                      Save FAQ to Profile
                    </button>
                  </div>
                </form>
              )}

              {/* FAQ Accordion List */}
              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#eceef0] bg-[#f8f9fc] overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#191c1e] hover:bg-[#f1f3f7] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#005f2a]/10 text-[#005f2a] flex items-center justify-center text-[12px] font-bold flex-shrink-0">
                            Q
                          </span>
                          <span>{faq.question}</span>
                        </span>
                        <span className={`material-symbols-outlined text-[18px] text-[#6f7a6e] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-[13px] text-[#3f493f] leading-relaxed border-t border-[#eceef0] bg-white">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Business Owner / Merchant Control Portal */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 border border-emerald-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005f2a]">storefront</span>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#005f2a]">
                      Business Owner / Merchant Control Portal
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#005f2a] text-white text-[11px] font-bold">
                    Owner Mode Active
                  </span>
                </div>
                <p className="text-[12px] text-[#3f493f]">
                  Quickly toggle your store open/closed status and update daily closing hours. Changes reflect instantly across the directory UI and live indicator.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Toggle Open / Closed */}
                  <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="text-[13px] font-semibold text-[#191c1e]">Live Status Indicator</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isOpenStatus;
                        setIsOpenStatus(next);
                        if (business) {
                          business.isOpen = next;
                          if (onUpdateBusiness) onUpdateBusiness(business);
                        }
                      }}
                      className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                        isOpenStatus ? 'bg-[#005f2a] text-white hover:bg-[#0f7a3a]' : 'bg-rose-700 text-white hover:bg-rose-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full animate-ping ${isOpenStatus ? 'bg-emerald-300' : 'bg-rose-300'}`}></span>
                      <span>{isOpenStatus ? 'Open Now' : 'Closed'}</span>
                    </button>
                  </div>

                  {/* Update Daily Closing Hours */}
                  <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                    <span className="text-[12px] font-semibold text-[#6f7a6e] whitespace-nowrap">Hours:</span>
                    <input
                      type="text"
                      value={closingHoursInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClosingHoursInput(val);
                        if (business) {
                          business.hours = val;
                          if (onUpdateBusiness) onUpdateBusiness(business);
                        }
                      }}
                      placeholder="e.g. 7:00 AM - 11:00 PM"
                      className="w-full text-[12px] font-bold text-[#191c1e] bg-transparent focus:outline-none"
                    />
                    <span className="material-symbols-outlined text-[16px] text-[#005f2a]">schedule</span>
                  </div>
                </div>
              </div>

              <p className="text-[14px] leading-relaxed text-[#3f493f]">
                {business.description}
              </p>

              {lang === 'አማ' && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-[#005f2a] font-bold text-[13px]">
                    <span className="material-symbols-outlined text-[18px]">translate</span>
                    <span>የአማርኛ መግለጫ (Amharic Description & Translation)</span>
                  </div>
                  <p className="text-[14px] text-[#191c1e] leading-relaxed font-['Noto_Sans_Ethiopic']">
                    {business.nameAmharic || business.name} - {business.description} (በአዲስ አበባ ከተማ አስተዳደር እና በንግድ ሚኒስቴር ፈቃድ የተሰጠውና በከፍተኛ ጥራት የሚታወቅ ታማኝ ድርጅት።)
                  </p>
                </div>
              )}

              {/* Horizontal Photo Gallery for Service Offerings */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005f2a]">photo_library</span>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-[#191c1e]">
                      Service Offerings & Store Gallery
                    </h4>
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#005f2a] font-bold">
                      {galleryImages.length} Photos
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingPhotoModal(true)}
                    className="text-[12px] font-bold text-[#005f2a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                    <span>Add Photo</span>
                  </button>
                </div>

                <div className="flex overflow-x-auto gap-3 pb-3 no-scrollbar scroll-smooth">
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImage(imgUrl)}
                      className="relative flex-shrink-0 w-52 h-36 rounded-2xl overflow-hidden shadow-xs border border-[#eceef0] group cursor-pointer hover:shadow-md transition-all bg-[#f2f4f6]"
                    >
                      <img
                        src={imgUrl}
                        alt={`${business.name} offering ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-white text-[12px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                          <span>Click to Enlarge</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review & Verified Ratings Section */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-white via-[#f8fbf9] to-emerald-50/40 border border-emerald-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005f2a]">rate_review</span>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-[#191c1e]">
                      Verified Customer Reviews & Rating
                    </h4>
                  </div>
                  <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[#005f2a] text-white shadow-xs">
                    ★ {currentRating.toFixed(1)} ({currentReviewCount} Reviews)
                  </span>
                </div>
                <p className="text-[13px] text-[#3f493f]">
                  Authenticated users can leave star ratings and review feedback for {business.name}. Reviews are stored securely in Firestore and instantly recalculate enterprise trust metrics.
                </p>
                <div className="pt-2">
                  <BusinessReviewsTab
                    business={business}
                    onRatingUpdated={(nr, nrc) => {
                      setCurrentRating(nr);
                      setCurrentReviewCount(nrc);
                      if (business) {
                        business.rating = nr;
                        business.reviewCount = nrc;
                        if (onUpdateBusiness) onUpdateBusiness(business);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Business Origin Story, Mission & Unique Selling Points */}
              <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#eceef0] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005f2a]">history_edu</span>
                  <h4 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#191c1e]">
                    Origin Story & Value Proposition
                  </h4>
                </div>
                <p className="text-[13px] text-[#3f493f] leading-relaxed">
                  Established as a flagship enterprise in {business.district}, {business.name} was founded with the core mission of delivering uncompromising quality and verified sovereign standards. Known for its distinct customer-first ethos, it serves as a cornerstone for consumers and B2B partners across Addis Ababa.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[#005f2a] text-[11px] font-bold border border-emerald-200">
                    USP: Sovereign MoT Compliance
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[#005f2a] text-[11px] font-bold border border-emerald-200">
                    Target: Local & International Buyers
                  </span>
                </div>
              </div>

              {/* Verified Badges & Credibility Trust Signals */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border border-emerald-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005f2a]">verified</span>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-[#191c1e]">
                      Verified Badges & Credibility Signals
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#005f2a] text-white text-[11px] font-bold shadow-xs">
                    Sovereign Accredited
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white border border-emerald-100 flex items-center gap-3 shadow-2xs">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#005f2a] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[22px]">badge</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6f7a6e] font-bold uppercase tracking-wider block">Official License</span>
                      <span className="text-[13px] font-extrabold text-[#191c1e]">MoT #{business.licenseNumber}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-emerald-100 flex items-center gap-3 shadow-2xs">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#005f2a] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6f7a6e] font-bold uppercase tracking-wider block">Experience</span>
                      <span className="text-[13px] font-extrabold text-[#191c1e]">8+ Years Active</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-emerald-100 flex items-center gap-3 shadow-2xs">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#005f2a] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[22px]">bolt</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6f7a6e] font-bold uppercase tracking-wider block">Response Time</span>
                      <span className="text-[13px] font-extrabold text-[#191c1e]">&lt; 15 mins avg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Metrics & Performance Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white border border-[#eceef0] text-center shadow-2xs">
                  <span className="text-[11px] text-[#6f7a6e] font-semibold block uppercase">Experience</span>
                  <span className="text-[16px] font-bold text-[#005f2a] font-['Plus_Jakarta_Sans']">8+ Years</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#eceef0] text-center shadow-2xs">
                  <span className="text-[11px] text-[#6f7a6e] font-semibold block uppercase">Team Size</span>
                  <span className="text-[16px] font-bold text-[#005f2a] font-['Plus_Jakarta_Sans']">22 Experts</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#eceef0] text-center shadow-2xs">
                  <span className="text-[11px] text-[#6f7a6e] font-semibold block uppercase">Clients Served</span>
                  <span className="text-[16px] font-bold text-[#005f2a] font-['Plus_Jakarta_Sans']">14,200+</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#eceef0] text-center shadow-2xs">
                  <span className="text-[11px] text-[#6f7a6e] font-semibold block uppercase">Response Time</span>
                  <span className="text-[16px] font-bold text-[#005f2a] font-['Plus_Jakarta_Sans']">&lt; 15 mins</span>
                </div>
              </div>

              {/* Languages Spoken & Amenities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#6f7a6e] uppercase tracking-wider block">Languages Spoken</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-white border border-[#eceef0] text-[12px] font-semibold text-[#191c1e]">አማርኛ (Amharic)</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-[#eceef0] text-[12px] font-semibold text-[#191c1e]">English</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-[#eceef0] text-[12px] font-semibold text-[#191c1e]">Afaan Oromo</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#6f7a6e] uppercase tracking-wider block">Amenities & Features</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-white border border-[#eceef0] text-[12px] font-semibold text-[#191c1e]">High-Speed Wi-Fi</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-[#eceef0] text-[12px] font-semibold text-[#191c1e]">Secure Parking</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-[#eceef0] text-[12px] font-semibold text-[#191c1e]">Air Conditioned</span>
                  </div>
                </div>
              </div>

              {/* Community Context & Events */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-white border border-emerald-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005f2a]">diversity_3</span>
                  <h4 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#191c1e]">
                    Community & Diaspora Context
                  </h4>
                </div>
                <p className="text-[12px] text-[#3f493f]">
                  Proudly Ethiopian-owned with active diaspora partnership programs and monthly merchant showcases held every first Saturday in {business.district}.
                </p>
              </div>

              {/* Mini Review Trend Teaser Card */}
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-[#dce5dc] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#005f2a]/10 flex items-center justify-center text-[#005f2a] flex-shrink-0">
                    <span className="material-symbols-outlined text-[22px]">auto_graph</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#191c1e]">
                      <span>6-Month Customer Sentiment Trajectory</span>
                      <span className="text-[11px] font-bold text-[#005f2a] bg-[#97f8a9]/30 px-1.5 py-0.2 rounded">
                        ★ {business.rating} / 5.0
                      </span>
                    </div>
                    <p className="text-[11px] text-[#606e60]">
                      Active growth in verified reviews across Bole & Addis Ababa districts
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('trends')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#005f2a]/30 hover:bg-[#005f2a] hover:text-white text-[#005f2a] text-[12px] font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  View Trend Dashboard →
                </button>
              </div>

              {/* Location & Contact Info */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start justify-between gap-3 text-[13px] text-[#191c1e] p-3 rounded-xl bg-[#f8f9fc] border border-[#eceef0]">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#005f2a] text-[20px] flex-shrink-0 mt-0.5">
                      location_on
                    </span>
                    <div>
                      <p className="font-semibold">{business.address}</p>
                      {business.addressAmharic && (
                        <p className="text-[#6f7a6e] text-[12px]">{business.addressAmharic}</p>
                      )}
                      <span className="text-[11px] text-[#6f7a6e] font-mono mt-0.5 block">
                        Coordinates: {business.lat.toFixed(4)}, {business.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[12px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      title="Open in Google Maps"
                    >
                      <span className="material-symbols-outlined text-[15px]">directions</span>
                      <span>Get Directions</span>
                    </a>
                    <button
                      onClick={handleCopyAddress}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#eceef0] text-[12px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
                    >
                      {copiedAddress ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-[13px] text-[#191c1e] p-3 rounded-xl bg-[#f8f9fc] border border-[#eceef0]">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#005f2a] text-[20px] flex-shrink-0">
                      schedule
                    </span>
                    <div>
                      <p className="font-semibold">Hours: {business.hours}</p>
                    </div>
                  </div>
                  <div>
                    {business.isOpen ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#005f2a] text-[12px] font-bold border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-[#005f2a] animate-pulse"></span>
                        Open
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[12px] font-bold border border-rose-300">
                          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                          Closed
                        </span>
                        <button
                          type="button"
                          onClick={() => setNotified(true)}
                          disabled={notified}
                          className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            notified
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#005f2a] hover:bg-[#0f7a3a] text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {notified ? 'notifications_active' : 'notifications'}
                          </span>
                          <span>{notified ? 'Will notify when open' : 'Notify when open'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-[13px] text-[#191c1e] p-3 rounded-xl bg-[#f8f9fc] border border-[#eceef0]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005f2a] text-[20px]">
                      call
                    </span>
                    <span className="font-mono font-bold text-[#005f2a] text-[14px]">
                      {business.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <button
                      onClick={handleCopyPhone}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#eceef0] text-[12px] font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors cursor-pointer"
                    >
                      {copiedPhone ? 'Copied!' : 'Copy'}
                    </button>
                    {(business.whatsapp || business.phone) && (
                      <a
                        href={`https://wa.me/${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${business.name}, I found your verified listing on EthioSpot and would like to inquire about your products/services.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#25d366] hover:bg-[#20ba5a] text-white text-[12px] font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                        title="Open WhatsApp Chat"
                      >
                        <span className="material-symbols-outlined text-[15px]">chat</span>
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <a
                      href={`tel:${business.phone}`}
                      className="px-3 py-1 rounded-lg bg-[#005f2a] text-white text-[12px] font-semibold hover:bg-[#0f7a3a] transition-colors cursor-pointer"
                    >
                      Call Now
                    </a>
                  </div>
                </div>
              </div>

              {/* Accepted Payments */}
              <div>
                <span className="text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider block mb-2">
                  Verified Payment Channels
                </span>
                <div className="flex flex-wrap gap-2">
                  {business.paymentMethods.map((pm) => (
                    <span
                      key={pm}
                      className="px-3 py-1 rounded-lg bg-[#bde9ff] text-[#001f2a] text-[12px] font-bold flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#045971]"></span>
                      {pm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Catalog / Features */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#f2f4f6] border border-[#eceef0] flex items-center gap-2 text-[13px] font-medium text-[#191c1e]"
                  >
                    <span className="material-symbols-outlined text-[#005f2a] text-[18px]">
                      check_circle
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div>
                <span className="text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider block mb-2">
                  Tags & Category Identifiers
                </span>
                <div className="flex flex-wrap gap-2">
                  {business.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-white border border-[#eceef0] text-[12px] text-[#3f493f]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Review Trends Dashboard */}
          {activeTab === 'trends' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <ReviewTrendMiniDashboard business={business} />
            </div>
          )}

          {/* Tab Content: Community Reviews & Ratings */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <BusinessReviewsTab
                business={business}
                onRatingUpdated={(nr, nrc) => {
                  setCurrentRating(nr);
                  setCurrentReviewCount(nrc);
                }}
              />
            </div>
          )}

          {/* Tab Content: Accreditation */}
          {activeTab === 'accreditation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#97f8a9]/20 border border-[#7bdb8f] text-[13px] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#005324]">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  <span>Ministry of Trade & Regional Integration Sovereign Seal</span>
                </div>
                <p className="text-[#005324]">
                  Registration Certificate License #{business.licenseNumber} is active and verified under the federal trade licensing framework.
                </p>
                <div className="pt-2 text-[11px] text-[#005324]/80 font-mono">
                  GIS Verified Coordinates: {business.lat.toFixed(4)}° N, {business.lng.toFixed(4)}° E
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[12px] text-[#6f7a6e]">Notice any outdated details or errors?</span>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">report</span>
                  <span>Report incorrect information</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab Content: Direct Chat Inquiry */}
          {activeTab === 'messages' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <BusinessChatTab business={business} />
            </div>
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 border-t border-[#eceef0] bg-[#f8f9fc] rounded-b-3xl flex items-center justify-between gap-2.5">
          <button
            onClick={() => onOpenMap(business)}
            className="flex-1 py-3 px-3 rounded-xl bg-white border border-[#eceef0] hover:bg-[#eceef0] text-[#191c1e] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#005f2a] text-[18px]">directions</span>
            <span>GIS Map</span>
          </button>
          <button
            onClick={() => downloadSingleBusinessPdf(business)}
            title="Download Official Enterprise Listing PDF"
            className="py-3 px-3 rounded-xl bg-white border border-[#005f2a]/30 hover:bg-[#97f8a9]/20 text-[#005f2a] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={() => onRequestQuote(business)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">request_quote</span>
            <span>Inquire / Quote</span>
          </button>
        </div>
      </div>

      <ReportDataModal
        business={business}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {isQrModalOpen && business && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#eceef0] relative space-y-5 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#005f2a]">
                <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e]">
                  Share via QR Code
                </h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                aria-label="Close QR Modal"
                className="w-8 h-8 rounded-full bg-[#f2f4f6] hover:bg-[#eceef0] flex items-center justify-center text-[#3f493f] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[13px] text-[#3f493f]">
              Scan this QR code with any smartphone camera to instantly open <strong className="text-[#191c1e]">{business.name}</strong> on EthioSpot during local commerce interactions.
            </p>

            <div className="flex justify-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-inner">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code for ${business.name}`}
                  className="w-56 h-56 rounded-xl shadow-md border-4 border-white object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-[#6f7a6e] text-[13px]">
                  Generating QR Code...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-[#6f7a6e] font-bold uppercase tracking-wider">Business Deep Link</div>
              <div className="p-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[12px] text-[#3f493f] truncate select-all">
                {businessDeepLink}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyDeepLink}
                className="flex-1 py-2.5 rounded-xl bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#e7e8eb]"
              >
                <span className="material-symbols-outlined text-[16px]">{copiedLink ? 'check' : 'content_copy'}</span>
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`${business.name.replace(/[^a-zA-Z0-9]/g, '_')}_QRCode.png`}
                  className="flex-1 py-2.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download PNG</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged service offering"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <p className="text-white text-[13px] mt-3 font-semibold opacity-90">
              {business.name} — Service Offering & Storefront Photo
            </p>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {isAddingPhotoModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#eceef0] relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans'] text-[16px] font-bold text-[#191c1e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#005f2a]">add_a_photo</span>
                <span>Add Photo to Gallery</span>
              </h3>
              <button
                onClick={() => setIsAddingPhotoModal(false)}
                className="w-8 h-8 rounded-full bg-[#f2f4f6] hover:bg-[#eceef0] flex items-center justify-center text-[#3f493f] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce0e5] text-[13px] focus:outline-none focus:border-[#005f2a]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPhotoModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f2f4f6] text-[#3f493f] text-[13px] font-bold hover:bg-[#eceef0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-bold shadow-md cursor-pointer transition-colors"
                >
                  Upload & Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
