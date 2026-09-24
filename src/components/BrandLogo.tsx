import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const textSize = size === 'sm' ? 'text-[18px]' : size === 'lg' ? 'text-[28px]' : 'text-[22px]';

  return (
    <div className="flex items-center gap-2.5 group cursor-pointer">
      {/* Official Brand Pin Icon */}
      <div 
        className="relative flex items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#005f2a" />
              <stop offset="100%" stopColor="#0a4420" />
            </linearGradient>
            <linearGradient id="topArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f9bd00" />
              <stop offset="100%" stopColor="#ff7700" />
            </linearGradient>
          </defs>
          {/* Outer Pin Body */}
          <path
            d="M50 5 C28 5 10 23 10 45 C10 68 50 95 50 95 C50 95 90 68 90 45 C90 23 72 5 50 5 Z"
            fill="url(#pinGrad)"
          />
          {/* Top Yellow-Orange Sun Arc */}
          <path
            d="M32 20 C38 14 62 14 68 20 C75 27 78 35 78 40 C78 40 50 35 22 40 C22 35 25 27 32 20 Z"
            fill="url(#topArcGrad)"
          />
          {/* White Storefront Background Circle/Shape */}
          <circle cx="50" cy="50" r="22" fill="#ffffff" />
          {/* Store / Shop Icon */}
          <path
            d="M38 58 V45 L50 36 L62 45 V58 H38 Z"
            fill="#005f2a"
          />
          <path
            d="M45 58 V50 H55 V58 H45 Z"
            fill="#ffffff"
          />
          {/* Awning stripes */}
          <path
            d="M36 43 L50 33 L64 43 H36 Z"
            fill="#f9bd00"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-['Plus_Jakarta_Sans'] ${textSize} font-bold tracking-tight leading-none flex items-center`}>
          <span className="text-[#191c1e]">Ethio</span>
          <span className="text-[#005f2a] ml-0.5">Spot</span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold text-[#6f7a6e] tracking-[0.2em] uppercase mt-1">
            Find . Connect . Grow
          </span>
        )}
      </div>
    </div>
  );
};
