import React, { useState } from 'react';
import { BusinessSpot } from '../types';

interface CompareViewProps {
  businesses: BusinessSpot[];
  comparedIds: string[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
  onSelectBusiness: (b: BusinessSpot) => void;
  onRequestQuote: (b: BusinessSpot) => void;
  onOpenMap: (b: BusinessSpot) => void;
  onNavigateDiscover: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  businesses,
  comparedIds,
  onRemoveFromCompare,
  onClearCompare,
  onSelectBusiness,
  onRequestQuote,
  onOpenMap,
  onNavigateDiscover,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const selectedBusinesses = businesses.filter((b) => comparedIds.includes(b.id));
  const availableToAdd = businesses.filter(
    (b) => !comparedIds.includes(b.id) && (
      b.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.categoryLabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.district.toLowerCase().includes(searchFilter.toLowerCase())
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#005f2a]/10 via-[#97f8a9]/20 to-white border border-[#005f2a]/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#005f2a] text-white text-[12px] font-bold tracking-wide">
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
            <span>Enterprise Side-by-Side Comparison</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[24px] md:text-[28px] font-bold text-[#191c1e]">
            Compare Verified Merchants ({selectedBusinesses.length}/3)
          </h1>
          <p className="text-[13px] text-[#3f493f]">
            Analyze pricing, licensing, payment channels, and operational specifications side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedBusinesses.length > 0 && (
            <button
              type="button"
              onClick={onClearCompare}
              className="px-4 py-2 rounded-xl bg-white border border-[#eceef0] text-[#191c1e] text-[13px] font-semibold hover:bg-[#f2f4f6] transition-colors cursor-pointer"
            >
              Clear Comparison
            </button>
          )}
          {selectedBusinesses.length < 3 && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Add Business to Compare</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {selectedBusinesses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-[#eceef0] text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#005f2a]/10 text-[#005f2a] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">balance</span>
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-[18px] text-[#191c1e]">No Businesses Selected for Comparison</h3>
            <p className="text-[13px] text-[#3f493f]">
              You can select up to 3 businesses from the Discover or Categories views to compare their ratings, pricing, and offerings side-by-side.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateDiscover}
            className="px-6 py-2.5 rounded-xl bg-[#005f2a] text-white text-[13px] font-semibold hover:bg-[#0f7a3a] transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore Businesses</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      ) : (
        /* Comparison Table Container */
        <div className="bg-white rounded-3xl border border-[#eceef0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#eceef0] bg-[#f8f9fc]">
                  <th className="p-4 w-48 text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider">
                    Parameter
                  </th>
                  {selectedBusinesses.map((b) => (
                    <th key={b.id} className="p-4 w-1/3 border-l border-[#eceef0]">
                      <div className="space-y-3">
                        <div className="relative h-32 rounded-2xl overflow-hidden bg-[#eceef0]">
                          <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => onRemoveFromCompare(b.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                            title="Remove from comparison"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[#005f2a] text-[10px] font-bold">
                            {b.categoryLabel}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-[15px] text-[#191c1e] line-clamp-1">{b.name}</h4>
                          <p className="text-[11px] text-[#3f493f] font-ethiopic">{b.nameAmharic}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                  {/* Empty placeholder column if < 3 */}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <th key={idx} className="p-4 w-1/3 border-l border-[#eceef0] bg-[#fcfcfc]">
                      <div className="h-48 rounded-2xl border-2 border-dashed border-[#dce0dc] flex flex-col items-center justify-center p-4 text-center space-y-2">
                        <span className="material-symbols-outlined text-[#9ca3af] text-[28px]">add_box</span>
                        <p className="text-[12px] text-[#6f7a6e]">Add another enterprise to compare</p>
                        <button
                          type="button"
                          onClick={() => setPickerOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-[#005f2a]/10 hover:bg-[#005f2a]/20 text-[#005f2a] text-[12px] font-bold transition-colors cursor-pointer"
                        >
                          Select Business
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eceef0] text-[13px]">
                {/* Rating Row */}
                <tr>
                  <td className="p-4 font-bold text-[#6f7a6e] bg-[#f8f9fc]">Rating & Reviews</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b.id} className="p-4 border-l border-[#eceef0]">
                      <div className="flex items-center gap-1.5 text-[#fdc002]">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="font-bold text-[#191c1e] text-[14px]">{b.rating}</span>
                        <span className="text-[12px] text-[#3f493f]">({b.reviewCount} reviews)</span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-l border-[#eceef0] bg-[#fcfcfc]" />
                  ))}
                </tr>

                {/* Pricing / Tariff Row */}
                <tr>
                  <td className="p-4 font-bold text-[#6f7a6e] bg-[#f8f9fc]">Tariff / Price Range</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b.id} className="p-4 border-l border-[#eceef0]">
                      <span className="font-bold text-[#005f2a] px-2.5 py-1 rounded-lg bg-[#005f2a]/10">
                        {b.priceRange}
                      </span>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-l border-[#eceef0] bg-[#fcfcfc]" />
                  ))}
                </tr>

                {/* District & Address Row */}
                <tr>
                  <td className="p-4 font-bold text-[#6f7a6e] bg-[#f8f9fc]">District & Location</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b.id} className="p-4 border-l border-[#eceef0] space-y-1">
                      <p className="font-semibold text-[#191c1e]">{b.district}</p>
                      <p className="text-[12px] text-[#3f493f]">{b.address}</p>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-l border-[#eceef0] bg-[#fcfcfc]" />
                  ))}
                </tr>

                {/* Licensing & Sovereign Seal Row */}
                <tr>
                  <td className="p-4 font-bold text-[#6f7a6e] bg-[#f8f9fc]">Licensing & Seal</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b.id} className="p-4 border-l border-[#eceef0] space-y-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#97f8a9]/30 text-[#005324] text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        <span>{b.licenseType}</span>
                      </span>
                      <p className="text-[11px] font-mono text-[#3f493f]">Reg #{b.licenseNumber}</p>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-l border-[#eceef0] bg-[#fcfcfc]" />
                  ))}
                </tr>

                {/* Hours & Status Row */}
                <tr>
                  <td className="p-4 font-bold text-[#6f7a6e] bg-[#f8f9fc]">Hours & Status</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b.id} className="p-4 border-l border-[#eceef0] space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${b.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {b.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                      <p className="text-[12px] text-[#3f493f]">{b.hours}</p>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-l border-[#eceef0] bg-[#fcfcfc]" />
                  ))}
                </tr>

                {/* Payment Methods Row */}
                <tr>
                  <td className="p-4 font-bold text-[#6f7a6e] bg-[#f8f9fc]">Payment Channels</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b.id} className="p-4 border-l border-[#eceef0]">
                      <div className="flex flex-wrap gap-1">
                        {b.paymentMethods.map((pm) => (
                          <span key={pm} className="px-2 py-0.5 rounded bg-[#bde9ff]/60 text-[#001f2a] text-[11px] font-semibold">
                            {pm}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-l border-[#eceef0] bg-[#fcfcfc]" />
                  ))}
                </tr>

                {/* Features & Services Row */}
                <tr>
                  <td className="p-4 font-bold text-[#6f7a6e] bg-[#f8f9fc]">Key Services & Features</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b.id} className="p-4 border-l border-[#eceef0]">
                      <ul className="space-y-1">
                        {b.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 text-[12px] text-[#3f493f]">
                            <span className="material-symbols-outlined text-[#005f2a] text-[15px]">check</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-l border-[#eceef0] bg-[#fcfcfc]" />
                  ))}
                </tr>

                {/* Actions Row */}
                <tr className="bg-[#f8f9fc]">
                  <td className="p-4 font-bold text-[#6f7a6e]">Quick Actions</td>
                  {selectedBusinesses.map((b) => (
                    <td key={b.id} className="p-4 border-l border-[#eceef0]">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectBusiness(b)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#eceef0] text-[#191c1e] text-[12px] font-semibold hover:bg-[#eceef0] transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenMap(b)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#eceef0] text-[#191c1e] text-[12px] font-semibold hover:bg-[#eceef0] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[15px] text-[#005f2a]">directions</span>
                          <span>Map</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestQuote(b)}
                          className="px-3 py-1.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[12px] font-semibold transition-colors shadow-sm cursor-pointer"
                        >
                          Inquire
                        </button>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - selectedBusinesses.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-l border-[#eceef0] bg-[#fcfcfc]" />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Picker Modal */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-[#eceef0] flex flex-col">
            <div className="p-4 border-b border-[#eceef0] flex items-center justify-between">
              <h3 className="font-bold text-[16px] text-[#191c1e]">Select Business to Compare</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f2f4f6] hover:bg-[#eceef0] flex items-center justify-center text-[#191c1e] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 border-b border-[#eceef0]">
              <input
                type="text"
                placeholder="Search businesses by name, category, or district..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] outline-none focus:border-[#005f2a]"
              />
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-96">
              {availableToAdd.length === 0 ? (
                <div className="text-center py-8 text-[#6f7a6e] text-[13px]">
                  No matching businesses available to add.
                </div>
              ) : (
                availableToAdd.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      if (comparedIds.length < 3) {
                        comparedIds.push(b.id);
                        setPickerOpen(false);
                      }
                    }}
                    className="w-full text-left p-3 rounded-2xl hover:bg-[#f8f9fc] border border-[#eceef0] flex items-center gap-3 transition-colors cursor-pointer group"
                  >
                    <img src={b.imageUrl} alt={b.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[14px] text-[#191c1e] truncate group-hover:text-[#005f2a]">
                          {b.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#005f2a] px-2 py-0.5 rounded-md bg-[#97f8a9]/20">
                          ★ {b.rating}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#3f493f] truncate">{b.district} • {b.priceRange}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
