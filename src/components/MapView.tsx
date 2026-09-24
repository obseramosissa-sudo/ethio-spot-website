import React, { useState } from 'react';
import { BusinessSpot, District } from '../types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface MapViewProps {
  businesses: BusinessSpot[];
  onSelectBusiness: (b: BusinessSpot) => void;
  activeSpot?: BusinessSpot | null;
  selectedDistrict: District;
  setSelectedDistrict: (d: District) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  businesses,
  onSelectBusiness,
  activeSpot: initialActiveSpot,
  selectedDistrict,
  setSelectedDistrict,
}) => {
  const [selectedSpot, setSelectedSpot] = useState<BusinessSpot | null>(
    initialActiveSpot || businesses[0] || null
  );

  const filteredSpots = businesses.filter((b) => {
    if (selectedDistrict === 'All Commercial Districts') return true;
    return b.district === selectedDistrict;
  });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Title & Corridor Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#97f8a9]/40 text-[#005f2a] mb-1.5 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[16px]">location_searching</span>
              <span>Commercial Corridor Map</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-[26px] md:text-[30px] font-bold text-[#191c1e]">
              Addis Ababa Commercial GIS Map
            </h1>
            <p className="text-[14px] text-[#3f493f]">
              Geospatial view of {filteredSpots.length} accredited enterprises in Addis Ababa.
            </p>
          </div>

          {/* Corridor Quick Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-[#6f7a6e]">Corridor:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value as District)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#eceef0] text-[13px] font-semibold text-[#191c1e] shadow-sm cursor-pointer"
            >
              <option value="All Commercial Districts">All Corridors (Addis Ababa)</option>
              <option value="Bole Medhanialem & Atlas">Bole Medhanialem & Atlas</option>
              <option value="Kazanchis & UNECA Area">Kazanchis & UNECA Area</option>
              <option value="Megenagna & CMC">Megenagna & CMC</option>
              <option value="Piazza & Arat Kilo">Piazza & Arat Kilo</option>
              <option value="Sarbet & Bisrate Gabriel">Sarbet & Bisrate Gabriel</option>
              <option value="Mercato & Kirkos">Mercato & Kirkos</option>
            </select>
          </div>
        </div>

        {/* Main Map + Directory split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Stage (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-3 border border-[#eceef0] shadow-sm flex flex-col relative overflow-hidden">
            <div className="w-full h-[520px] rounded-2xl relative overflow-hidden border border-[#eceef0]">
              <Map
                defaultCenter={{ lat: 9.0, lng: 38.75 }}
                defaultZoom={13}
                mapId="DEMO_MAP_ID"
              >
                {filteredSpots.map((spot) => (
                  <AdvancedMarker
                    key={spot.id}
                    position={{ lat: spot.lat, lng: spot.lng }}
                    onClick={() => setSelectedSpot(spot)}
                  >
                    <Pin background={selectedSpot?.id === spot.id ? '#005f2a' : '#ffffff'} glyphColor={selectedSpot?.id === spot.id ? '#ffffff' : '#005f2a'} />
                  </AdvancedMarker>
                ))}
              </Map>
            </div>
          </div>

          {/* Selected Spot Detail Spotlight Card (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#eceef0] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#eceef0] pb-3">
              <span className="text-[11px] uppercase font-bold text-[#6f7a6e]">
                Selected Enterprise
              </span>
              <span className="text-[11px] bg-[#97f8a9]/30 text-[#005f2a] px-2 py-0.5 rounded-full font-bold">
                GPS Active
              </span>
            </div>

            {selectedSpot ? (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="relative h-44 rounded-2xl overflow-hidden bg-[#eceef0]">
                  <img
                    src={selectedSpot.imageUrl}
                    alt={selectedSpot.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/95 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-[#191c1e]">
                    {selectedSpot.licenseType}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#005f2a] font-bold uppercase tracking-wider block">
                    {selectedSpot.categoryLabel}
                  </span>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e] leading-snug">
                    {selectedSpot.name}
                  </h3>
                  <p className="text-[12px] text-[#6f7a6e] mt-0.5">{selectedSpot.address}</p>
                </div>

                <div className="flex items-center justify-between text-[12px] bg-[#f8f9fc] p-3 rounded-xl border border-[#eceef0]">
                  <div>
                    <span className="text-[#6f7a6e] block text-[10px] uppercase">Rating</span>
                    <span className="font-bold text-[#191c1e]">★ {selectedSpot.rating} ({selectedSpot.reviewCount})</span>
                  </div>
                  <div>
                    <span className="text-[#6f7a6e] block text-[10px] uppercase">Price / Rates</span>
                    <span className="font-bold text-[#005f2a]">{selectedSpot.priceRange}</span>
                  </div>
                  <div>
                    <span className="text-[#6f7a6e] block text-[10px] uppercase">Status</span>
                    <span className="font-bold text-[#005f2a]">{selectedSpot.isOpen ? 'Open Now' : 'Closed'}</span>
                  </div>
                </div>

                <p className="text-[13px] text-[#3f493f] leading-relaxed line-clamp-3">
                  {selectedSpot.description}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onSelectBusiness(selectedSpot)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#005f2a] text-white text-[13px] font-semibold hover:bg-[#0f7a3a] transition-all text-center shadow-sm cursor-pointer"
                  >
                    Full Spot Profile
                  </button>
                  <a
                    href={`tel:${selectedSpot.phone}`}
                    className="p-2.5 rounded-xl bg-[#eceef0] hover:bg-[#e7e8eb] text-[#191c1e] transition-all flex items-center justify-center cursor-pointer"
                    title="Call spot"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#005f2a]">call</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#6f7a6e] text-[13px]">
                Click any marker on the map to inspect details.
              </div>
            )}

            {/* Quick list of other corridor spots */}
            <div className="pt-4 border-t border-[#eceef0]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6f7a6e] block mb-2">
                Corridor Directory ({filteredSpots.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-[#f2f4f6]">
                {filteredSpots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-[12px] transition-colors ${
                      selectedSpot?.id === spot.id
                        ? 'bg-[#97f8a9]/20 font-bold text-[#005f2a]'
                        : 'hover:bg-[#f8f9fc] text-[#191c1e]'
                    }`}
                  >
                    <span className="truncate pr-2">{spot.name}</span>
                    <span className="text-[10px] text-[#6f7a6e] flex-shrink-0">{spot.distanceKm} km</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </APIProvider>
  );
};
