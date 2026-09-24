import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#f2f4f6] border-t border-[#eceef0] mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[#3f493f] text-[12px]">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <span className="font-semibold text-[#191c1e]">
              © 2025 Ethio Spot. Sovereign trade directory operated in coordination with the Ministry of Trade & Regional Integration enterprise verification network.
            </span>
            <span className="text-[#6f7a6e]">
              Official Registry Portal for Enterprise Verification, Commercial GIS Mapping & Local Telebirr Digital Settlement.
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-[11px] uppercase tracking-wider text-[#6f7a6e] font-bold">
              Verified by MoT
            </span>
            <span className="h-3 w-px bg-[#becabc]"></span>
            <span className="text-[11px] text-[#3f493f] font-medium">
              Addis Ababa • Oromia • Amhara • Dire Dawa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
