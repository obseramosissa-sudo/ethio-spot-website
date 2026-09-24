import React, { useState } from 'react';
import { BusinessSpot, QuoteRequest } from '../types';

interface ConciergeQuoteModalProps {
  business?: BusinessSpot | null;
  onClose: () => void;
  onSubmitQuote: (quote: QuoteRequest) => void;
}

export const ConciergeQuoteModal: React.FC<ConciergeQuoteModalProps> = ({
  business,
  onClose,
  onSubmitQuote,
}) => {
  const [formData, setFormData] = useState<QuoteRequest>({
    businessId: business?.id,
    businessName: business?.name || 'General Enterprise B2B Inquiry',
    category: business?.categoryLabel || 'Wholesale & B2B Procurement',
    contactName: '',
    phone: '',
    email: '',
    quantityNotes: '',
    organization: '',
    urgency: 'Standard (1-2 weeks)',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitQuote(formData);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eceef0] relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f2f4f6] hover:bg-[#eceef0] text-[#3f493f] flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#97f8a9]/40 text-[#005f2a] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-[22px] font-bold text-[#191c1e]">
              Quote Request Dispatched
            </h3>
            <p className="text-[14px] text-[#3f493f] max-w-sm mx-auto">
              Our Addis Ababa trade concierge and verified merchant account managers have received your commercial inquiry. A verified quotation will be sent via SMS / Telegram within 2 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-[#005f2a]">
              <span className="material-symbols-outlined text-[24px]">support_agent</span>
              <span className="text-[12px] font-bold uppercase tracking-wider">
                EthioSpot B2B Trade Concierge
              </span>
            </div>

            <h3 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-[#191c1e]">
              {business ? `Request Quote: ${business.name}` : 'Commercial Procurement Request'}
            </h3>
            <p className="text-[13px] text-[#3f493f]">
              Direct commercial dispatch to accredited Ethiopian suppliers and corporate merchants.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Full Name / Authorized Buyer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Abebe Kebede"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                    Phone (Telebirr / Mobile) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+251 911 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                    Enterprise / Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nile Logistics PLC"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Procurement Scope & Quantity Details *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your commercial requirements (e.g. 50kg roasted Yirgacheffe coffee beans, 15 ThinkPad workstations, or 100 corporate banquet covers)..."
                  value={formData.quantityNotes}
                  onChange={(e) => setFormData({ ...formData, quantityNotes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#191c1e] mb-1">
                  Timeline / Fulfillment Urgency
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) =>
                    setFormData({ ...formData, urgency: e.target.value as QuoteRequest['urgency'] })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#eceef0] bg-[#f8f9fc] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#005f2a]/30 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Immediate (24-48h)">Immediate (24-48h Express)</option>
                  <option value="Standard (1-2 weeks)">Standard Commercial (1-2 weeks)</option>
                  <option value="Bulk / Tender">Enterprise Bulk / Government Tender</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#eceef0] text-[13px] font-semibold text-[#3f493f] hover:bg-[#f2f4f6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#fdc002] hover:brightness-105 text-[#6c5000] font-['Plus_Jakarta_Sans'] text-[14px] font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Submit Merchant Quote</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
