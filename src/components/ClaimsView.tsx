import React, { useState } from 'react';
import { BusinessSpot, ClaimRequest } from '../types';
import { persistClaim } from '../lib/firebase';

interface ClaimsViewProps {
  businesses: BusinessSpot[];
}

export const ClaimsView: React.FC<ClaimsViewProps> = ({ businesses }) => {
  const [selectedSpotId, setSelectedSpotId] = useState<string>(businesses[0]?.id || '');
  const [tinNumber, setTinNumber] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantRole, setApplicantRole] = useState('Founder / Managing Director');
  const [applicantPhone, setApplicantPhone] = useState('+251 9');
  const [submittedClaims, setSubmittedClaims] = useState<ClaimRequest[]>([
    {
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
      businessName: 'Bethzatha Emergency Clinic & 24/7 Pharmacy',
      licenseNumber: 'EFDA-HL-883912',
      tinNumber: '0081290341',
      applicantName: 'Dr. Selamawit Tadesse',
      role: 'Chief Medical Officer',
      applicantPhone: '+251 115 514 141',
      status: 'Under MoT Verification',
      submittedAt: 'Today, 10:30 AM',
    },
  ]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const spot = businesses.find((b) => b.id === selectedSpotId);
    if (!spot) return;

    const newClaim: ClaimRequest = {
      businessName: spot.name,
      licenseNumber: spot.licenseNumber,
      tinNumber: tinNumber || `TIN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      applicantName: applicantName || 'Authorized Representative',
      role: applicantRole,
      applicantPhone: applicantPhone || '+251 911 000 000',
      status: 'Under MoT Verification',
      submittedAt: 'Just now',
    };

    setSubmittedClaims([newClaim, ...submittedClaims]);
    setShowSuccess(true);
    fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClaim),
    }).catch((e) => console.warn('Cloud SQL claim sync error:', e));
    try {
      await persistClaim(newClaim);
    } catch (err) {
      console.error('Failed to sync claim to Firestore:', err);
    }
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdf9d]/50 text-[#785a00] mb-2 text-[11px] font-bold">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span>Sovereign Trade Ownership & Verification Portal</span>
        </div>
        <h1 className="font-['Plus_Jakarta_Sans'] text-[28px] md:text-[34px] font-bold text-[#191c1e]">
          Claim an Existing Registry Listing
        </h1>
        <p className="text-[15px] text-[#3f493f] mt-1">
          Are you the registered owner, manager, or legal representative of an enterprise already listed on EthioSpot? Submit your Ministry of Trade TIN and credentials to take control of your profile, update operating hours, and manage Telebirr payment endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-[#eceef0] shadow-sm space-y-5">
          <h2 className="text-[18px] font-bold text-[#191c1e] pb-2 border-b border-[#eceef0]">
            Submit Enterprise Ownership Claim
          </h2>

          {showSuccess && (
            <div className="p-4 rounded-2xl bg-[#97f8a9]/30 border border-[#005f2a]/30 text-[#005324] text-[14px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Claim submitted! Ministry of Trade registry officers will verify your TIN within 24 hours.</span>
            </div>
          )}

          <form onSubmit={handleSubmitClaim} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                Select Listed Enterprise to Claim *
              </label>
              <select
                value={selectedSpotId}
                onChange={(e) => setSelectedSpotId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] font-semibold text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all cursor-pointer"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.district.split('&')[0]}) — #{b.licenseNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Ministry of Revenue TIN (10-digit) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0039281726"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] font-mono focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Applicant Role / Authority *
                </label>
                <select
                  value={applicantRole}
                  onChange={(e) => setApplicantRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Founder / Managing Director">Founder / Managing Director</option>
                  <option value="Branch Operations Manager">Branch Operations Manager</option>
                  <option value="Finance & Tax Officer">Finance & Tax Officer</option>
                  <option value="Legal Counsel / Power of Attorney">Legal Counsel / Power of Attorney</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Applicant Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Almaz Bekele"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Authorized Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+251 911 000 000"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#eceef0] text-[12px] text-[#3f493f] space-y-1">
              <p className="font-bold text-[#191c1e]">Required Verification Protocol:</p>
              <p>
                An automated SMS verification code and verification call will be sent to the official telephone associated with this commercial registration license.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white font-['Plus_Jakarta_Sans'] text-[15px] font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Submit Verification Claim</span>
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </button>
          </form>
        </div>

        {/* Existing Claims Tracker (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#eceef0] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eceef0]">
            <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e]">
              Active Registry Claims ({submittedClaims.length})
            </h3>
            <span className="text-[11px] text-[#005f2a] bg-[#97f8a9]/30 px-2 py-0.5 rounded-full font-bold">
              MoT Live Sync
            </span>
          </div>

          <div className="space-y-3">
            {submittedClaims.map((claim, idx) => {
              const isApproved = claim.status === 'Approved';
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#eceef0] space-y-2 hover:border-[#005f2a]/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[14px] text-[#191c1e] leading-snug">
                      {claim.businessName}
                    </h4>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                        isApproved
                          ? 'bg-[#97f8a9]/50 text-[#00210a]'
                          : 'bg-[#ffdf9d] text-[#251a00]'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <div className="text-[12px] text-[#3f493f] space-y-0.5">
                    <p>
                      License: <span className="font-mono font-semibold">{claim.licenseNumber}</span>
                    </p>
                    <p>
                      TIN: <span className="font-mono font-semibold">{claim.tinNumber}</span>
                    </p>
                    <p>
                      Applicant: <span className="font-medium">{claim.applicantName}</span> ({claim.role})
                    </p>
                  </div>

                  <div className="pt-1 text-[11px] text-[#6f7a6e] flex items-center justify-between">
                    <span>Submitted: {claim.submittedAt}</span>
                    {isApproved && (
                      <span className="text-[#005f2a] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock_open</span>
                        Admin Dashboard Ready
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
