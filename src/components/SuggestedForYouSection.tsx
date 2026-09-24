import React, { useState, useEffect } from 'react';
import { BusinessSpot } from '../types';

interface SuggestedForYouSectionProps {
  businesses: BusinessSpot[];
  onSelectBusiness: (b: BusinessSpot) => void;
  lang: 'EN' | 'አማ';
}

export const SuggestedForYouSection: React.FC<SuggestedForYouSectionProps> = ({
  businesses,
  onSelectBusiness,
  lang,
}) => {
  const [topCategory, setTopCategory] = useState<string | null>(null);
  const [suggestedList, setSuggestedList] = useState<BusinessSpot[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ethiospot_category_history');
      if (raw) {
        const history: Record<string, number> = JSON.parse(raw);
        const sortedCategories = Object.entries(history).sort((a, b) => b[1] - a[1]);
        if (sortedCategories.length > 0) {
          const favoriteCat = sortedCategories[0][0];
          setTopCategory(favoriteCat);
          const matched = businesses.filter((b) => b.category === favoriteCat);
          if (matched.length > 0) {
            setSuggestedList(matched.slice(0, 4));
            return;
          }
        }
      }
    } catch {
      // fallback
    }

    // Default fallback: top rated or featured
    const fallback = businesses.filter((b) => b.rating >= 4.8 || b.featured).slice(0, 4);
    setSuggestedList(fallback);
  }, [businesses]);

  if (suggestedList.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#005f2a] text-[20px]">auto_awesome</span>
            <h3 className="font-['Plus_Jakarta_Sans'] text-[20px] lg:text-[24px] font-bold text-[#191c1e] tracking-tight">
              {lang === 'አማ' ? 'ለእርስዎ የተመረጡ ንግዶች' : 'Suggested For You'}
            </h3>
          </div>
          <p className="text-[13px] text-[#3f493f]">
            {topCategory
              ? `Personalized recommendations based on your recent browsing in ${topCategory}`
              : 'Handpicked enterprises matched to your local commercial interests'}
          </p>
        </div>
        <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#005f2a] border border-emerald-200">
          AI Curated Locally
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {suggestedList.map((b) => (
          <div
            key={b.id}
            onClick={() => onSelectBusiness(b)}
            className="group bg-white rounded-2xl border border-[#e7e8eb] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
          >
            <div className="relative h-44 overflow-hidden bg-[#e7e8eb]">
              <img
                src={b.imageUrl}
                alt={b.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-[#005f2a] text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-sm">
                {b.categoryLabel}
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[11px] font-bold text-[#191c1e] shadow-sm flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-[14px] text-[#fdc002]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                {b.rating}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-[#191c1e] group-hover:text-[#005f2a] transition-colors mb-1">
                  {b.name}
                </h4>
                <p className="text-[12px] text-[#3f493f] line-clamp-2 mb-3">
                  {b.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#eceef0] flex items-center justify-between text-[12px]">
                <span className="text-[#3f493f] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#005f2a]">location_on</span>
                  {b.district.split('&')[0]}
                </span>
                <span className="font-bold text-[#005f2a]">
                  {b.priceRange}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
