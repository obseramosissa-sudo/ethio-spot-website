import React, { useState, useMemo } from 'react';
import { BusinessSpot, CategoryId, District } from '../types';
import { DIRECTORY_CATEGORIES } from '../data/businesses';

interface CategoriesViewProps {
  businesses: BusinessSpot[];
  onSelectBusiness: (b: BusinessSpot) => void;
  onOpenMap: (b: BusinessSpot) => void;
  selectedDistrict: District;
  setSelectedDistrict: (d: District) => void;
  onOpenExportPdf?: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  businesses,
  onSelectBusiness,
  onOpenMap,
  selectedDistrict,
  setSelectedDistrict,
  onOpenExportPdf,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterPayment, setFilterPayment] = useState<'all' | 'Telebirr' | 'CBE Birr'>('all');

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
      if (selectedDistrict !== 'All Commercial Districts' && b.district !== selectedDistrict) return false;
      if (filterVerifiedOnly && !b.licenseType.includes('Verified') && !b.licenseType.includes('Licensed')) return false;
      if (filterPayment !== 'all' && !b.paymentMethods.includes(filterPayment)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          b.name.toLowerCase().includes(q) ||
          b.nameAmharic.includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [businesses, selectedCategory, selectedDistrict, filterVerifiedOnly, filterPayment, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#97f8a9]/40 text-[#005f2a] mb-2 text-[11px] font-bold">
            <span className="material-symbols-outlined text-[16px]">category</span>
            <span>Official Ministry of Trade Sector Taxonomy</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-[28px] md:text-[34px] font-bold text-[#191c1e]">
            Official Ethiopian Sector Directory
          </h1>
          <p className="text-[15px] text-[#3f493f] max-w-3xl mt-1">
            Browse verified enterprises, commercial distributors, healthcare providers, and traditional hospitality partners across 24 licensed industry sectors.
          </p>
        </div>

        {onOpenExportPdf && (
          <button
            type="button"
            onClick={onOpenExportPdf}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white border border-[#005f2a]/30 hover:bg-[#97f8a9]/20 text-[#005f2a] font-bold text-[13px] flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>Export Directory (PDF)</span>
          </button>
        )}
      </div>

      {/* Sector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-[#005f2a] text-white shadow-sm'
              : 'bg-white border border-[#eceef0] text-[#3f493f] hover:bg-[#f2f4f6]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">apps</span>
          <span>All Sectors ({businesses.length})</span>
        </button>
        {DIRECTORY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as CategoryId)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-[#005f2a] text-white shadow-sm'
                : 'bg-white border border-[#eceef0] text-[#3f493f] hover:bg-[#f2f4f6]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#eceef0] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f2f4f6] border border-[#eceef0]">
          <span className="material-symbols-outlined text-[#005f2a] text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search by name, tags, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[13px] text-[#191c1e]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* District selector */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value as District)}
            className="px-3 py-2 rounded-xl bg-[#f2f4f6] text-[13px] font-semibold text-[#191c1e] border border-[#eceef0] cursor-pointer"
          >
            <option value="All Commercial Districts">All Corridors</option>
            <option value="Bole Medhanialem & Atlas">Bole Medhanialem</option>
            <option value="Kazanchis & UNECA Area">Kazanchis / UNECA</option>
            <option value="Megenagna & CMC">Megenagna / CMC</option>
            <option value="Piazza & Arat Kilo">Piazza / Arat Kilo</option>
            <option value="Sarbet & Bisrate Gabriel">Sarbet / Bisrate</option>
            <option value="Mercato & Kirkos">Mercato / Kirkos</option>
          </select>

          {/* Payment filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-[#f2f4f6] text-[13px] font-semibold text-[#191c1e] border border-[#eceef0] cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="Telebirr">Telebirr Accepted</option>
            <option value="CBE Birr">CBE Birr Accepted</option>
          </select>

          {/* Verified toggle */}
          <button
            onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
            className={`px-3 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-colors border ${
              filterVerifiedOnly
                ? 'bg-[#97f8a9]/40 text-[#005f2a] border-[#005f2a]'
                : 'bg-white text-[#3f493f] border-[#eceef0]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>MoT Verified Only</span>
          </button>
        </div>
      </div>

      {/* Grid of Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#eceef0] p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#f2f4f6] text-[#6f7a6e] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <h3 className="text-[18px] font-bold text-[#191c1e]">No enterprises found</h3>
          <p className="text-[14px] text-[#3f493f] mt-1">
            No accredited merchants match the active filters. Try broadening your district or clearing search tags.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDistrict('All Commercial Districts');
              setSearchQuery('');
              setFilterVerifiedOnly(false);
              setFilterPayment('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#005f2a] text-white text-[13px] font-semibold hover:bg-[#0f7a3a]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group border border-[#eceef0]"
            >
              <div>
                <div
                  onClick={() => onSelectBusiness(spot)}
                  className="relative w-full h-52 overflow-hidden bg-[#eceef0] cursor-pointer"
                >
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={spot.imageUrl}
                    alt={spot.name}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#191c1e] px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[#005f2a] text-[14px]">verified</span>
                    <span>{spot.licenseType}</span>
                  </div>
                  <div className="absolute top-3 right-3 bg-[#005f2a] text-white px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-sm">
                    {spot.isOpen ? 'Open for Business' : 'Closed'}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[#3f493f] font-medium">{spot.subCategory}</span>
                    <span className="text-[11px] text-[#005f2a] font-bold">{spot.priceRange}</span>
                  </div>
                  <h3
                    onClick={() => onSelectBusiness(spot)}
                    className="font-['Plus_Jakarta_Sans'] text-[18px] font-semibold text-[#191c1e] group-hover:text-[#005f2a] transition-colors cursor-pointer leading-snug"
                  >
                    {spot.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <div className="flex items-center text-[#fdc002]">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span className="text-[12px] text-[#191c1e] font-bold ml-1">{spot.rating}</span>
                    </div>
                    <span className="text-[12px] text-[#3f493f]">({spot.reviewCount} reviews)</span>
                    <span className="text-[#becabc] text-[12px]">•</span>
                    <span className="text-[12px] text-[#3f493f]">{spot.district.split('&')[0]}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {spot.paymentMethods.map((pm) => (
                      <span
                        key={pm}
                        className="px-2 py-0.5 rounded-md bg-[#bde9ff] text-[#001f2a] text-[11px] font-semibold"
                      >
                        {pm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center gap-2">
                <button
                  onClick={() => onSelectBusiness(spot)}
                  className="flex-1 py-2.5 px-2 rounded-xl bg-[#e7e8eb] hover:bg-[#e1e2e5] text-[#191c1e] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#005f2a]">info</span>
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => onOpenMap(spot)}
                  className="flex-1 py-2.5 px-2 rounded-xl bg-[#005f2a] text-white text-[12px] font-semibold hover:bg-[#0f7a3a] flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  <span>Map Route</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
