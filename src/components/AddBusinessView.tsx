import React, { useState } from 'react';
import { BusinessSpot, CategoryId, District, NavigationTab } from '../types';
import { DIRECTORY_CATEGORIES } from '../data/businesses';
import { CameraCaptureModal } from './CameraCaptureModal';

interface AddBusinessViewProps {
  onAddBusiness: (b: BusinessSpot) => void;
  setActiveTab: (t: NavigationTab) => void;
}

export const AddBusinessView: React.FC<AddBusinessViewProps> = ({
  onAddBusiness,
  setActiveTab,
}) => {
  const [name, setName] = useState('');
  const [nameAmharic, setNameAmharic] = useState('');
  const [category, setCategory] = useState<CategoryId>('dining');
  const [district, setDistrict] = useState<District>('Bole Medhanialem & Atlas');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [priceRange, setPriceRange] = useState('250 - 600 ETB');
  const [description, setDescription] = useState('');
  const [payments, setPayments] = useState<('Telebirr' | 'CBE Birr' | 'POS Card')[]>([
    'Telebirr',
    'CBE Birr',
  ]);
  const [imageUrl, setImageUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDWiagvlIK1XA7mwFba7tJSVTmyNbQHwdfPNd-fToLVzMXKkMRpECuS72P1Gmq6b7TOfTJTx7loxaSCGgwMvtNeq0sHkbY0JKa2bgkBqVxWgelP_ldEYCE4O8r29HIJQpGgWdcuXA5LFnecny6VXZZHxoujnpMY8QL_0fJ-2bxGIR3d5K8LYOtDBBuD6_kKFRXL2p61W1NDpRLWumBgVG3i5mpm1-8YzIeWBmOZ3ZEmmK2u6ulpM96P'
  );
  const [submitted, setSubmitted] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const togglePayment = (p: 'Telebirr' | 'CBE Birr' | 'POS Card') => {
    if (payments.includes(p)) {
      setPayments(payments.filter((x) => x !== p));
    } else {
      setPayments([...payments, p]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catObj = DIRECTORY_CATEGORIES.find((c) => c.id === category);

    const newSpot: BusinessSpot = {
      id: `custom-${Date.now()}`,
      name: name.trim() || 'New Ethiopian Enterprise',
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
      distanceKm: 0.5,
      priceRange: priceRange || 'Competitive B2B Rates',
      imageUrl,
      tags: ['MoT Registered', 'Telebirr Verified', 'Local Enterprise'],
      paymentMethods: payments.length > 0 ? (payments as any) : ['Telebirr'],
      phone: phone.trim() || '+251 911 000 000',
      description: description.trim() || 'Accredited Ethiopian enterprise newly listed in the sovereign commercial trade registry.',
      lat: 8.995,
      lng: 38.785,
      features: ['Verified Commercial License', 'Digital Telebirr Pay', 'Direct Phone Inquiry'],
    };

    onAddBusiness(newSpot);
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Page Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#97f8a9]/40 text-[#005f2a] mb-2 text-[11px] font-bold">
          <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
          <span>Ministry of Trade & Regional Integration Gateway</span>
        </div>
        <h1 className="font-['Plus_Jakarta_Sans'] text-[28px] md:text-[34px] font-bold text-[#191c1e]">
          Register Your Enterprise in EthioSpot
        </h1>
        <p className="text-[15px] text-[#3f493f] mt-1 leading-relaxed">
          Gain sovereign trade registry verification, verified MoT badge recognition, high-precision GIS indexing, and direct Telebirr QR customer payment integration.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-3xl p-8 max-w-xl mx-auto border border-[#eceef0] text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#97f8a9]/40 text-[#005f2a] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[36px]">verified</span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[24px] font-bold text-[#191c1e]">
            Enterprise Registered Successfully!
          </h2>
          <p className="text-[14px] text-[#3f493f] leading-relaxed">
            <strong>{name}</strong> is now live in the sovereign commercial registry with MoT License #{licenseNumber}. It is now searchable across Addis Ababa and indexed on the interactive GIS map.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveTab('discover')}
              className="px-6 py-2.5 rounded-xl bg-[#005f2a] text-white text-[14px] font-semibold hover:bg-[#0f7a3a]"
            >
              View on Discover
            </button>
            <button
              onClick={() => setActiveTab('map-view')}
              className="px-6 py-2.5 rounded-xl bg-[#eceef0] hover:bg-[#e7e8eb] text-[#191c1e] text-[14px] font-semibold"
            >
              Open on GIS Map
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Registration Form (7 cols) */}
          <form
            onSubmit={handleFormSubmit}
            className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-[#eceef0] shadow-sm space-y-5"
          >
            <h2 className="text-[18px] font-bold text-[#191c1e] pb-2 border-b border-[#eceef0]">
              1. Enterprise Profile & License Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Enterprise Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abyssinia Roasters PLC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  የንግድ ስም (በአማርኛ)
                </label>
                <input
                  type="text"
                  placeholder="ምሳሌ፦ አቢሲኒያ ቡና ቆዪዎች"
                  value={nameAmharic}
                  onChange={(e) => setNameAmharic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Commercial Sector Taxonomy *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all cursor-pointer"
                >
                  {DIRECTORY_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Commercial District / Sub-city *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as District)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all cursor-pointer"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  MoT Commercial License / Registration # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 008921822"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] font-mono focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Contact Phone (Telebirr enabled) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+251 911 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                Precise Landmark & Street Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cameroon St, Next to Edna Mall 3rd Floor"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                Typical Price Range / Rate Note
              </label>
              <input
                type="text"
                placeholder="e.g. 150 - 450 ETB"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                Storefront Photo / Enterprise Image Upload
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    const reader = new FileReader();
                    reader.onload = (uploadEvent) => {
                      if (uploadEvent.target?.result) {
                        setImageUrl(uploadEvent.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="border-2 border-dashed border-[#005f2a]/30 rounded-xl p-4 text-center bg-[#f8f9fc] hover:bg-[#97f8a9]/10 transition-colors cursor-pointer relative"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (uploadEvent) => {
                        if (uploadEvent.target?.result) {
                          setImageUrl(uploadEvent.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <span className="material-symbols-outlined text-[32px] text-[#005f2a]">cloud_upload</span>
                  <p className="text-[13px] font-bold text-[#191c1e]">
                    Drag & drop enterprise image here, or <span className="text-[#005f2a] underline">browse</span>
                  </p>
                  <p className="text-[11px] text-[#6f7a6e]">Supports PNG, JPG, WEBP (Max 5MB)</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[11px] text-[#6f7a6e]">Need a quick snapshot?</span>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#005f2a]/10 hover:bg-[#005f2a]/20 text-[#005f2a] text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>Capture from Camera</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                Commercial Description & Offerings
              </label>
              <textarea
                rows={3}
                placeholder="Describe your goods, wholesale capabilities, corporate discounts, or menu highlights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
              ></textarea>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#191c1e] mb-2">
                Accepted Payment Integrations
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Telebirr', 'CBE Birr', 'POS Card'] as const).map((p) => {
                  const active = payments.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePayment(p)}
                      className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-colors flex items-center gap-1.5 ${
                        active
                          ? 'bg-[#bde9ff] text-[#001f2a] border-[#045971]'
                          : 'bg-[#f8f9fc] text-[#6f7a6e] border-[#eceef0]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {active ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white font-['Plus_Jakarta_Sans'] text-[16px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register & Verify Enterprise</span>
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </button>
            </div>
          </form>

          {/* Live Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-24">
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#6f7a6e] mb-2 flex items-center justify-between">
                <span>Live Registry Listing Preview</span>
                <span className="text-[#005f2a] font-semibold">Auto-Synced</span>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#eceef0] flex flex-col">
                <div className="relative w-full h-48 bg-[#eceef0]">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 text-[#191c1e] px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#005f2a] text-[14px]">verified</span>
                    <span>MoT Verified</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-[#005f2a] text-white px-2.5 py-1 rounded-md text-[11px] font-semibold">
                    Open for Business
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#3f493f]">
                      {DIRECTORY_CATEGORIES.find((c) => c.id === category)?.name} • {district.split('&')[0]}
                    </span>
                    <span className="text-[#005f2a] font-bold">{priceRange || 'Rates on inquiry'}</span>
                  </div>

                  <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e]">
                    {name || 'Enterprise Name'}
                  </h3>
                  {nameAmharic && (
                    <p className="text-[12px] text-[#6f7a6e] font-ethiopic">{nameAmharic}</p>
                  )}

                  <p className="text-[12px] text-[#3f493f] line-clamp-2">
                    {description || 'Comprehensive enterprise goods and services provider listed in the official Ethiopian registry.'}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                    {payments.map((pm) => (
                      <span
                        key={pm}
                        className="px-2 py-0.5 rounded-md bg-[#bde9ff] text-[#001f2a] text-[11px] font-semibold"
                      >
                        {pm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 pt-0 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-xl bg-[#eceef0] text-[#191c1e] text-[12px] font-semibold"
                  >
                    Inquire Spot
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-xl bg-[#005f2a] text-white text-[12px] font-semibold"
                  >
                    Map Route
                  </button>
                </div>
              </div>

              {/* Ministry badge banner */}
              <div className="mt-4 p-4 rounded-2xl bg-[#97f8a9]/20 border border-[#7bdb8f] text-[12px] text-[#005324] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Official Verification Guarantee
                </p>
                <p className="text-[11px]">
                  All newly registered businesses receive an authenticated Ministry of Trade registration seal and automated Telebirr merchant payment routing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(url) => setImageUrl(url)}
        title="Capture Enterprise Listing Photo"
      />
    </div>
  );
};
