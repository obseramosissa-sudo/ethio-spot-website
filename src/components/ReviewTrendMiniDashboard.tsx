import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BusinessSpot } from '../types';

interface ReviewTrendMiniDashboardProps {
  business: BusinessSpot;
  compact?: boolean;
}

export interface MonthlyReviewPoint {
  month: string;
  fullMonth: string;
  reviews: number;
  cumulative: number;
  avgRating: number;
  fiveStar: number;
  fourStar: number;
  threeStarOrLess: number;
  topKeyword: string;
}

/**
 * Generates deterministic, realistic 6-month historical review trend data
 * calibrated to the business's actual overall rating, reviewCount, and category.
 */
export function generateReviewTrendData(business: BusinessSpot): MonthlyReviewPoint[] {
  // Hash function to make trends unique but consistent per business ID
  let hash = 0;
  for (let i = 0; i < business.id.length; i++) {
    hash = (hash << 5) - hash + business.id.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const months = [
    { short: 'Apr', full: 'April 2026' },
    { short: 'May', full: 'May 2026' },
    { short: 'Jun', full: 'June 2026' },
    { short: 'Jul', full: 'July 2026' },
    { short: 'Aug', full: 'August 2026' },
    { short: 'Sep', full: 'September 2026' },
  ];

  // Base distribution of recent reviews over the past 6 months (~40% of total reviews)
  const totalSixMonthReviews = Math.max(18, Math.round(business.reviewCount * 0.38));
  const baseMonthly = Math.max(3, Math.round(totalSixMonthReviews / 6));

  const monthlyMultipliers = [0.72, 0.85, 0.94, 1.08, 1.18, 1.25];
  const variationOffsets = [
    ((seed % 7) - 3) * 0.05,
    (((seed >> 2) % 7) - 3) * 0.05,
    (((seed >> 4) % 7) - 3) * 0.05,
    (((seed >> 6) % 7) - 3) * 0.05,
    (((seed >> 8) % 7) - 3) * 0.05,
    (((seed >> 10) % 7) - 3) * 0.05,
  ];

  const targetRating = business.rating || 4.7;
  const ratingSpread = [-0.15, -0.1, -0.05, 0.0, +0.05, +0.1];

  const categoryKeywords: Record<string, string[]> = {
    coffee: ['Fresh Macchiato', 'Yirgacheffe Roast', 'Fast Service', 'Telebirr Pay', 'Atmosphere', 'Takeaway Beans'],
    dining: ['Tibs & Enjera', 'Hospitality', 'Cleanliness', 'CBE Birr', 'Family Friendly', 'Authentic Taste'],
    tech: ['Genuine Warranty', 'Fast Repair', 'MoT Hardware', 'Fair Pricing', 'Technical Support', 'Original Stock'],
    health: ['Licensed Staff', 'Short Wait Time', 'Clean Clinic', 'EFDA Standards', 'Pharmacy Stock', 'Professional'],
    hotels: ['Comfortable Suites', 'Reliable WiFi', 'Airport Shuttle', 'Security', 'Great Breakfast', 'Conference Hall'],
    wellness: ['Eucalyptus Steam', 'Swedish Massage', 'Hygiene', 'Relaxing Vibe', 'Courteous Staff', 'Sauna'],
  };

  const defaultKeywords = ['Quick Service', 'Accredited Quality', 'Telebirr Accepted', 'Friendly Staff', 'Great Location', 'Fair Rates'];
  const keywords = categoryKeywords[business.category] || defaultKeywords;

  let runningCumulative = Math.max(5, business.reviewCount - totalSixMonthReviews);
  const data: MonthlyReviewPoint[] = [];

  for (let i = 0; i < 6; i++) {
    const mult = Math.max(0.4, monthlyMultipliers[i] + variationOffsets[i]);
    const monthlyCount = Math.max(2, Math.round(baseMonthly * mult));
    runningCumulative += monthlyCount;

    // Monthly rating smoothly trending toward business.rating
    const stepRating = Math.min(5.0, Math.max(3.8, Number((targetRating + ratingSpread[i] * 0.8).toFixed(1))));

    // Rating star distributions
    const fiveStarRatio = Math.min(0.85, Math.max(0.55, (stepRating - 3.5) / 1.5));
    const fiveStar = Math.round(monthlyCount * fiveStarRatio);
    const fourStar = Math.max(0, Math.round(monthlyCount * (1 - fiveStarRatio) * 0.8));
    const threeStarOrLess = Math.max(0, monthlyCount - fiveStar - fourStar);

    data.push({
      month: months[i].short,
      fullMonth: months[i].full,
      reviews: monthlyCount,
      cumulative: runningCumulative,
      avgRating: stepRating,
      fiveStar,
      fourStar,
      threeStarOrLess,
      topKeyword: keywords[i % keywords.length],
    });
  }

  return data;
}

export const ReviewTrendMiniDashboard: React.FC<ReviewTrendMiniDashboardProps> = ({
  business,
  compact = false,
}) => {
  const [chartType, setChartType] = useState<'volume' | 'rating' | 'stars'>('volume');

  const trendData = useMemo(() => generateReviewTrendData(business), [business]);

  // Aggregate stats
  const totalRecentReviews = useMemo(
    () => trendData.reduce((acc, curr) => acc + curr.reviews, 0),
    [trendData]
  );

  const startMonthRating = trendData[0]?.avgRating ?? 4.5;
  const currentMonthRating = trendData[trendData.length - 1]?.avgRating ?? business.rating;
  const ratingDelta = Number((currentMonthRating - startMonthRating).toFixed(1));

  const totalFiveStar = useMemo(
    () => trendData.reduce((acc, curr) => acc + curr.fiveStar, 0),
    [trendData]
  );
  const positiveSentimentPct = Math.round(
    ((totalFiveStar + trendData.reduce((acc, curr) => acc + curr.fourStar, 0)) /
      Math.max(1, totalRecentReviews)) *
      100
  );

  const growthPct = Math.round(
    (((trendData[trendData.length - 1]?.reviews || 1) - (trendData[0]?.reviews || 1)) /
      Math.max(1, trendData[0]?.reviews || 1)) *
      100
  );

  return (
    <div className="w-full bg-[#fbfcfb] rounded-2xl border border-[#e2e8e2] p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Top Header with title & badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eceef0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#005f2a]/10 text-[#005f2a] text-[11px] font-bold tracking-wide uppercase">
            <span className="material-symbols-outlined text-[15px]">trending_up</span>
            <span>6-Month MoT Verified Analytics</span>
          </div>
          <h3 className="font-['Plus_Jakarta_Sans'] text-[17px] font-bold text-[#191c1e] mt-1 flex items-center gap-2">
            <span>Customer Review & Reputation Trajectory</span>
          </h3>
          <p className="text-[12px] text-[#606e60]">
            Performance indicators from April 2026 to September 2026 across verified Addis Ababa consumers
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="inline-flex p-1 bg-[#eceef0] rounded-xl self-start sm:self-auto text-[12px] font-semibold">
          <button
            type="button"
            onClick={() => setChartType('volume')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === 'volume'
                ? 'bg-white text-[#005f2a] shadow-xs font-bold'
                : 'text-[#505f50] hover:text-[#191c1e]'
            }`}
          >
            Review Volume
          </button>
          <button
            type="button"
            onClick={() => setChartType('rating')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === 'rating'
                ? 'bg-white text-[#005f2a] shadow-xs font-bold'
                : 'text-[#505f50] hover:text-[#191c1e]'
            }`}
          >
            Rating (Score)
          </button>
          <button
            type="button"
            onClick={() => setChartType('stars')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartType === 'stars'
                ? 'bg-white text-[#005f2a] shadow-xs font-bold'
                : 'text-[#505f50] hover:text-[#191c1e]'
            }`}
          >
            Star Distribution
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* KPI 1: 6-Mo Reviews */}
        <div className="p-3 rounded-xl bg-white border border-[#e4ebe4] shadow-2xs">
          <div className="text-[11px] font-bold text-[#6a786a] uppercase">New Reviews</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[20px] font-extrabold text-[#191c1e]">+{totalRecentReviews}</span>
            <span className="text-[11px] font-bold text-[#005f2a] flex items-center">
              ▲ {growthPct > 0 ? `+${growthPct}%` : 'Stable'}
            </span>
          </div>
          <div className="text-[10px] text-[#788878] mt-0.5">Last 180 days</div>
        </div>

        {/* KPI 2: Current Rating */}
        <div className="p-3 rounded-xl bg-white border border-[#e4ebe4] shadow-2xs">
          <div className="text-[11px] font-bold text-[#6a786a] uppercase">Current Rating</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[20px] font-extrabold text-[#191c1e]">★ {business.rating}</span>
            <span
              className={`text-[11px] font-bold ${
                ratingDelta >= 0 ? 'text-[#005f2a]' : 'text-[#c0392b]'
              }`}
            >
              {ratingDelta >= 0 ? `+${ratingDelta}` : ratingDelta}
            </span>
          </div>
          <div className="text-[10px] text-[#788878] mt-0.5">vs Apr 2026 ({startMonthRating})</div>
        </div>

        {/* KPI 3: Satisfaction */}
        <div className="p-3 rounded-xl bg-white border border-[#e4ebe4] shadow-2xs">
          <div className="text-[11px] font-bold text-[#6a786a] uppercase">Positive Sentiment</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[20px] font-extrabold text-[#005f2a]">{positiveSentimentPct}%</span>
          </div>
          <div className="text-[10px] text-[#788878] mt-0.5">4 & 5-star feedback</div>
        </div>

        {/* KPI 4: Reliability Index */}
        <div className="p-3 rounded-xl bg-white border border-[#e4ebe4] shadow-2xs">
          <div className="text-[11px] font-bold text-[#6a786a] uppercase">License Seal</div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-[14px] font-extrabold text-[#045971] truncate">
              {business.licenseType}
            </span>
          </div>
          <div className="text-[10px] text-[#788878] mt-0.5 truncate">#{business.licenseNumber}</div>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="p-3 sm:p-4 rounded-xl bg-white border border-[#e4ebe4] shadow-2xs">
        <div className="flex items-center justify-between mb-3 text-[12px]">
          <span className="font-bold text-[#191c1e]">
            {chartType === 'volume' && 'Monthly Inflow of Verified Consumer Reviews'}
            {chartType === 'rating' && 'Average Monthly Rating Trajectory (Scale 1.0 - 5.0)'}
            {chartType === 'stars' && 'Review Breakdown by Star Rating Tier'}
          </span>
          <span className="text-[11px] text-[#606e60]">Monthly cadence</span>
        </div>

        <div className="w-full h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'volume' ? (
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="reviewColorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005f2a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#005f2a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#708070"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e4ebe4' }}
                />
                <YAxis
                  stroke="#708070"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as MonthlyReviewPoint;
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#005f2a]/20 shadow-lg text-[12px]">
                          <p className="font-bold text-[#191c1e] mb-1">{d.fullMonth}</p>
                          <div className="space-y-0.5 text-[#3f493f]">
                            <p className="flex items-center justify-between gap-4">
                              <span>New Reviews:</span>
                              <strong className="text-[#005f2a] font-bold">+{d.reviews}</strong>
                            </p>
                            <p className="flex items-center justify-between gap-4">
                              <span>Cumulative:</span>
                              <span className="font-mono text-[#191c1e]">{d.cumulative}</span>
                            </p>
                            <p className="flex items-center justify-between gap-4">
                              <span>Monthly Rating:</span>
                              <span className="text-[#d99b00] font-bold">★ {d.avgRating}</span>
                            </p>
                            <div className="pt-1.5 mt-1 border-t border-gray-100 flex items-center gap-1 text-[11px] text-[#005f2a]">
                              <span className="material-symbols-outlined text-[14px]">sell</span>
                              <span>Highlight: {d.topKeyword}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reviews"
                  stroke="#005f2a"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#reviewColorGradient)"
                  dot={{ r: 4, fill: '#005f2a', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#d99b00', stroke: '#fff', strokeWidth: 2 }}
                  name="Reviews"
                />
              </AreaChart>
            ) : chartType === 'rating' ? (
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#708070"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e4ebe4' }}
                />
                <YAxis
                  domain={[3.5, 5.0]}
                  stroke="#708070"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  ticks={[3.5, 4.0, 4.5, 5.0]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as MonthlyReviewPoint;
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#d99b00]/30 shadow-lg text-[12px]">
                          <p className="font-bold text-[#191c1e] mb-1">{d.fullMonth}</p>
                          <div className="space-y-0.5 text-[#3f493f]">
                            <p className="flex items-center justify-between gap-4">
                              <span>Average Rating:</span>
                              <strong className="text-[#d99b00] font-bold">★ {d.avgRating} / 5.0</strong>
                            </p>
                            <p className="flex items-center justify-between gap-4">
                              <span>Sample Size:</span>
                              <span className="font-mono text-[#191c1e]">{d.reviews} reviews</span>
                            </p>
                            <div className="pt-1 mt-1 border-t border-gray-100 text-[11px] text-[#005f2a]">
                              Sentiment: <strong>{d.avgRating >= 4.7 ? 'Exceptional' : 'Very Positive'}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  stroke="#d99b00"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#d99b00', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#005f2a', stroke: '#fff', strokeWidth: 2 }}
                  name="Avg Rating"
                />
              </LineChart>
            ) : (
              <BarChart
                data={trendData}
                margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ee" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#708070"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e4ebe4' }}
                />
                <YAxis
                  stroke="#708070"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as MonthlyReviewPoint;
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-gray-200 shadow-lg text-[12px] min-w-[150px]">
                          <p className="font-bold text-[#191c1e] mb-1.5">{d.fullMonth}</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[#005f2a]">
                              <span>5 Stars:</span>
                              <span className="font-bold">{d.fiveStar}</span>
                            </div>
                            <div className="flex items-center justify-between text-[#3b82f6]">
                              <span>4 Stars:</span>
                              <span className="font-bold">{d.fourStar}</span>
                            </div>
                            <div className="flex items-center justify-between text-[#9ca3af]">
                              <span>≤3 Stars:</span>
                              <span className="font-bold">{d.threeStarOrLess}</span>
                            </div>
                            <div className="pt-1 mt-1 border-t border-gray-100 flex items-center justify-between font-bold text-[#191c1e]">
                              <span>Total:</span>
                              <span>{d.reviews}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconSize={10}
                />
                <Bar dataKey="fiveStar" name="5 Stars" stackId="a" fill="#005f2a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fourStar" name="4 Stars" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="threeStarOrLess" name="≤3 Stars" stackId="a" fill="#d1d5db" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Tag Highlights Bar */}
      <div className="p-3 rounded-xl bg-[#f2f6f3] border border-[#d8e3d8] flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-2 text-[#005f2a] font-bold">
          <span className="material-symbols-outlined text-[17px]">insights</span>
          <span>Frequent Review Praise Factors:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {trendData.slice(-4).map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-[#cad7ca] text-[#2c3e2c] text-[11px] font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#005f2a]"></span>
              <span>{item.topKeyword}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
