import React, { useState } from 'react';
import { BusinessSpot, District } from '../types';
import { downloadDirectoryPdf } from '../lib/pdfGenerator';
import { DIRECTORY_CATEGORIES } from '../data/businesses';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: BusinessSpot[];
  activeDistrict: District;
  activeSearchQuery?: string;
  onSuccessToast?: (msg: string) => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  businesses,
  activeDistrict,
  activeSearchQuery = '',
  onSuccessToast,
}) => {
  const [scope, setScope] = useState<'current' | 'all' | 'custom'>('current');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(activeDistrict);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [layout, setLayout] = useState<'cards' | 'table'>('cards');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter businesses based on chosen settings
  const filteredBusinesses = businesses.filter((b) => {
    if (scope === 'all') return true;

    if (scope === 'current') {
      const matchesDistrict =
        activeDistrict === 'All Commercial Districts' || b.district === activeDistrict;
      const q = activeSearchQuery.toLowerCase().trim();
      if (!q) return matchesDistrict;
      const matchesQuery =
        b.name.toLowerCase().includes(q) ||
        (b.nameAmharic && b.nameAmharic.includes(q)) ||
        b.categoryLabel.toLowerCase().includes(q) ||
        b.district.toLowerCase().includes(q);
      return matchesDistrict && matchesQuery;
    }

    // custom scope
    const matchesDistrict =
      selectedDistrict === 'All Commercial Districts' || b.district === selectedDistrict;
    const matchesCategory =
      selectedCategory === 'all' || b.category === selectedCategory;
    return matchesDistrict && matchesCategory;
  });

  const handleExport = () => {
    if (filteredBusinesses.length === 0) return;

    setIsGenerating(true);

    // Give UI time to show generating spinner
    setTimeout(() => {
      try {
        const districtLabel =
          scope === 'current'
            ? activeDistrict
            : scope === 'all'
            ? 'All Commercial Districts'
            : selectedDistrict;

        const categoryLabel =
          scope === 'custom' && selectedCategory !== 'all'
            ? DIRECTORY_CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory
            : 'All Sectors';

        const filename = downloadDirectoryPdf({
          businesses: filteredBusinesses,
          title: 'EthioSpot — Ethiopian Commercial & Trade Directory',
          subtitle: `Accredited Commercial Registry • ${districtLabel} • ${filteredBusinesses.length} Enterprises`,
          districtFilter: districtLabel,
          categoryFilter: categoryLabel,
          layout,
        });

        if (onSuccessToast) {
          onSuccessToast(`PDF Directory successfully exported (${filteredBusinesses.length} enterprises)!`);
        }
        onClose();
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 150);
  };

  const DISTRICT_OPTIONS: District[] = [
    'All Commercial Districts',
    'Bole Medhanialem & Atlas',
    'Kazanchis & UNECA Area',
    'Megenagna & CMC',
    'Piazza & Arat Kilo',
    'Sarbet & Bisrate Gabriel',
    'Mercato & Kirkos',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#eceef0] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#005f2a] to-[#045971] text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-outlined text-[26px] text-[#97f8a9]">
                picture_as_pdf
              </span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ffdf9d] uppercase tracking-wider">
                <span>Print & Distribution Center</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold leading-tight">
                Export Directory to PDF
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/15 transition-colors text-white/80 hover:text-white cursor-pointer"
            aria-label="Close export modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content Form */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Scope Selector */}
          <div>
            <label className="block text-[12px] font-bold text-[#191c1e] mb-2 uppercase tracking-wide">
              1. Select Export Scope
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setScope('current')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  scope === 'current'
                    ? 'border-[#005f2a] bg-[#97f8a9]/15 text-[#005f2a]'
                    : 'border-[#eceef0] hover:border-gray-300 text-[#3f493f]'
                }`}
              >
                <div className="text-[13px] font-bold text-[#191c1e]">Current View</div>
                <div className="text-[11px] text-[#555] mt-0.5">
                  Filtered ({businesses.filter((b) => activeDistrict === 'All Commercial Districts' || b.district === activeDistrict).length} spots)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  scope === 'all'
                    ? 'border-[#005f2a] bg-[#97f8a9]/15 text-[#005f2a]'
                    : 'border-[#eceef0] hover:border-gray-300 text-[#3f493f]'
                }`}
              >
                <div className="text-[13px] font-bold text-[#191c1e]">Full Directory</div>
                <div className="text-[11px] text-[#555] mt-0.5">
                  All ({businesses.length} total)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('custom')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  scope === 'custom'
                    ? 'border-[#005f2a] bg-[#97f8a9]/15 text-[#005f2a]'
                    : 'border-[#eceef0] hover:border-gray-300 text-[#3f493f]'
                }`}
              >
                <div className="text-[13px] font-bold text-[#191c1e]">Custom Filter</div>
                <div className="text-[11px] text-[#555] mt-0.5">By district / sector</div>
              </button>
            </div>
          </div>

          {/* Custom Filter Controls if Custom is selected */}
          {scope === 'custom' && (
            <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-[#eceef0] space-y-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold text-[#3f493f] mb-1">
                  Target Commercial District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full text-[13px] p-2.5 rounded-xl border border-[#eceef0] bg-white text-[#191c1e] focus:outline-none focus:border-[#005f2a]"
                >
                  {DISTRICT_OPTIONS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3f493f] mb-1">
                  Industry Sector / Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-[13px] p-2.5 rounded-xl border border-[#eceef0] bg-white text-[#191c1e] focus:outline-none focus:border-[#005f2a]"
                >
                  <option value="all">All Sectors & Industries</option>
                  {DIRECTORY_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Layout Style Selector */}
          <div>
            <label className="block text-[12px] font-bold text-[#191c1e] mb-2 uppercase tracking-wide">
              2. Document Format & Layout
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLayout('cards')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  layout === 'cards'
                    ? 'border-[#005f2a] bg-[#97f8a9]/15'
                    : 'border-[#eceef0] hover:border-gray-300'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${layout === 'cards' ? 'text-[#005f2a]' : 'text-[#3f493f]'}`}>
                  view_agenda
                </span>
                <div>
                  <div className="text-[13px] font-bold text-[#191c1e]">Compendium Cards</div>
                  <div className="text-[11px] text-[#555] mt-0.5">
                    Spacious cards with descriptions, contacts, licenses & accepted payments.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLayout('table')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  layout === 'table'
                    ? 'border-[#005f2a] bg-[#97f8a9]/15'
                    : 'border-[#eceef0] hover:border-gray-300'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${layout === 'table' ? 'text-[#005f2a]' : 'text-[#3f493f]'}`}>
                  table_chart
                </span>
                <div>
                  <div className="text-[13px] font-bold text-[#191c1e]">Tabular Trade Register</div>
                  <div className="text-[11px] text-[#555] mt-0.5">
                    High-density data tables optimized for paper printing and procurement lists.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Live Document Summary Preview */}
          <div className="p-4 rounded-2xl bg-[#97f8a9]/20 border border-[#005f2a]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px] text-[#005f2a]">
                verified
              </span>
              <div>
                <p className="text-[13px] font-bold text-[#005f2a]">
                  Ready to Export: {filteredBusinesses.length} Verified Listings
                </p>
                <p className="text-[11px] text-[#3f493f]">
                  A4 format • Offline printable • Includes Ministry of Trade license IDs & Telebirr numbers
                </p>
              </div>
            </div>
            <span className="text-[12px] font-bold text-[#005f2a] bg-white px-2.5 py-1 rounded-lg border border-[#005f2a]/20 shadow-xs">
              PDF
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 md:p-6 bg-[#f8f9fc] border-t border-[#eceef0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#eceef0] text-[#3f493f] font-semibold text-[13px] hover:bg-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredBusinesses.length === 0 || isGenerating}
            className="px-6 py-2.5 rounded-xl bg-[#005f2a] text-white font-bold text-[14px] hover:bg-[#0f7a3a] transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Download PDF ({filteredBusinesses.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
