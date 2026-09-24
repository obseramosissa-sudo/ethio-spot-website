import React, { useState } from 'react';
import { BusinessSpot } from '../types';
import { createPromotion } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

interface PostPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: BusinessSpot[];
  onPromotionCreated: () => void;
}

export const PostPromotionModal: React.FC<PostPromotionModalProps> = ({
  isOpen,
  onClose,
  businesses,
  onPromotionCreated,
}) => {
  const { user } = useAuth();
  const [selectedBusinessId, setSelectedBusinessId] = useState(businesses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Flash Sale');
  const [discountBadge, setDiscountBadge] = useState('20% OFF');
  const [expiresInDays, setExpiresInDays] = useState('3');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to post a promotion.');
      return;
    }
    const business = businesses.find((b) => b.id === selectedBusinessId);
    if (!business) {
      setError('Please select a valid business.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + parseInt(expiresInDays || '3', 10));

      await createPromotion({
        businessId: business.id,
        businessName: business.name,
        title: title.trim(),
        description: description.trim(),
        category,
        discountBadge: discountBadge.trim() || undefined,
        expiresAt: expirationDate.toISOString(),
      });

      onPromotionCreated();
      onClose();
    } catch (err: any) {
      console.error('Error posting promotion:', err);
      setError(err?.message || 'Failed to post promotion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#eceef0] overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-[#eceef0] flex items-center justify-between bg-[#f8f9fc]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005f2a]/10 text-[#005f2a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">local_activity</span>
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#191c1e]">Post Event or Promotion</h3>
              <p className="text-[12px] text-[#3f493f]">Share time-sensitive updates with Addis Ababa shoppers</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
              Select Business / Merchant
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a]"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
              Promotion Type / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a]"
            >
              <option value="Flash Sale">⚡ Flash Sale</option>
              <option value="Special Event">🎉 Special Event / Launch</option>
              <option value="Holiday Discount">🎁 Holiday Discount</option>
              <option value="B2B Offer">🤝 B2B Bulk Offer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
                Promotion Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bole Weekend Mega Clearance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
                Discount / Badge Text
              </label>
              <input
                type="text"
                value={discountBadge}
                onChange={(e) => setDiscountBadge(e.target.value)}
                placeholder="e.g. 30% OFF or FREE Delivery"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
              Description & Details
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what shoppers or partners can expect, promo codes, valid hours..."
              className="w-full p-3 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] placeholder:text-[#9ca3af] outline-none focus:border-[#005f2a] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
              Duration / Expiration
            </label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a]"
            >
              <option value="1">Expires in 24 Hours</option>
              <option value="3">Expires in 3 Days</option>
              <option value="7">Expires in 7 Days (1 Week)</option>
              <option value="14">Expires in 14 Days (2 Weeks)</option>
              <option value="30">Expires in 30 Days (1 Month)</option>
            </select>
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
              {submitting ? 'Posting...' : 'Post Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
