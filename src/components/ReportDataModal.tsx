import React, { useState } from 'react';
import { BusinessSpot } from '../types';
import { persistDataReport } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface ReportDataModalProps {
  business: BusinessSpot;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportDataModal: React.FC<ReportDataModalProps> = ({
  business,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [issueType, setIssueType] = useState('Incorrect Phone Number');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide details regarding the incorrect information.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await persistDataReport({
        businessId: business.id,
        businessName: business.name,
        issueType,
        description: description.trim(),
        userEmail: userEmail.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#eceef0] overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-[#eceef0] flex items-center justify-between bg-[#f8f9fc]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">report</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#191c1e]">Report Incorrect Information</h3>
              <p className="text-[12px] text-[#3f493f]">Help keep EthioSpot verified and accurate</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#eceef0] hover:bg-[#f2f4f6] flex items-center justify-center text-[#191c1e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#97f8a9]/20 text-[#005324] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h4 className="font-bold text-[16px] text-[#191c1e]">Report Logged Successfully</h4>
            <p className="text-[13px] text-[#3f493f]">
              Thank you! Our compliance team will review your correction regarding <strong>{business.name}</strong> shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px]">
                {error}
              </div>
            )}

            <div className="p-3 rounded-2xl bg-[#f8f9fc] border border-[#eceef0] space-y-1">
              <span className="text-[11px] font-bold text-[#6f7a6e] uppercase tracking-wider">Target Business</span>
              <p className="font-bold text-[14px] text-[#191c1e]">{business.name} ({business.nameAmharic})</p>
              <p className="text-[12px] text-[#3f493f]">MoT License: {business.licenseNumber} • {business.district}</p>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
                Issue Category
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a]"
              >
                <option value="Incorrect Phone Number">Incorrect Phone Number</option>
                <option value="Wrong Location or Address">Wrong Location or Address</option>
                <option value="Business Permanently Closed">Business Permanently Closed</option>
                <option value="Revoked or Invalid License">Revoked or Invalid License</option>
                <option value="Incorrect Pricing or Services">Incorrect Pricing or Services</option>
                <option value="Other Data Discrepancy">Other Data Discrepancy</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
                Description of Error & Correct Info
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what is incorrect and what the correct information should be..."
                className="w-full p-3 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] placeholder:text-[#9ca3af] outline-none focus:border-[#005f2a] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
                Your Contact Email (Optional)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="e.g. citizen@ethiospot.et"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#eceef0] text-[#191c1e] text-[13px] font-semibold hover:bg-[#f2f4f6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] disabled:opacity-50 text-white text-[13px] font-semibold transition-colors shadow-sm cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
