import React, { useState } from 'react';
import { getUserActivities, UserActivityItem } from '../lib/userActivity';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface UserProfileActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

const sparklineData = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 45 + Math.sin(i / 3) * 25 + (i > 22 ? (i - 22) * 6 : 0);
  return {
    day: `Day ${day}`,
    views: Math.max(20, Math.round(base + Math.random() * 30)),
    calls: Math.max(5, Math.round(base * 0.35 + Math.random() * 10)),
    directions: Math.max(10, Math.round(base * 0.55 + Math.random() * 15)),
  };
});

export const UserProfileActivityModal: React.FC<UserProfileActivityModalProps> = ({
  isOpen,
  onClose,
  userName,
  userEmail,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'activity' | 'insights'>('activity');
  const [filter, setFilter] = useState<'all' | 'review' | 'favorite' | 'inquiry'>('all');
  const activities = getUserActivities();

  if (!isOpen) return null;

  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    return act.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'review':
        return 'star';
      case 'favorite':
        return 'favorite';
      case 'inquiry':
        return 'chat';
      default:
        return 'history';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'favorite':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'inquiry':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#eceef0] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#eceef0] flex items-center justify-between bg-[#f8f9fc]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#005f2a] text-white flex items-center justify-center font-bold text-[16px] shadow-sm">
              {(userName || userEmail || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e]">
                {userName || 'Merchant Profile'} — User Hub
              </h3>
              <p className="text-[12px] text-[#6f7a6e]">
                {userEmail || 'Authenticated Firebase User'} • Account & Business Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eceef0] hover:bg-[#e2e4e8] text-[#3f493f] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Main Tab Switcher: Activity vs Insights */}
        <div className="px-6 py-3 bg-white border-b border-[#eceef0] flex items-center gap-3">
          <button
            onClick={() => setActiveMainTab('activity')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'activity'
                ? 'bg-[#005f2a] text-white shadow-sm'
                : 'bg-[#f8f9fc] text-[#3f493f] hover:bg-[#eceef0]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Recent Activity History</span>
          </button>
          <button
            onClick={() => setActiveMainTab('insights')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMainTab === 'insights'
                ? 'bg-[#005f2a] text-white shadow-sm'
                : 'bg-[#f8f9fc] text-[#3f493f] hover:bg-[#eceef0]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">bar_chart</span>
            <span>My Business Insights (Owner)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#f8f9fc]/50 flex-1">
          {activeMainTab === 'activity' ? (
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-[#005f2a] text-white shadow-xs'
                      : 'bg-white border border-[#eceef0] text-[#3f493f] hover:bg-[#eceef0]'
                  }`}
                >
                  All Activity ({activities.length})
                </button>
                <button
                  onClick={() => setFilter('review')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                    filter === 'review'
                      ? 'bg-[#005f2a] text-white shadow-xs'
                      : 'bg-white border border-[#eceef0] text-[#3f493f] hover:bg-[#eceef0]'
                  }`}
                >
                  Reviews ({activities.filter((a) => a.type === 'review').length})
                </button>
                <button
                  onClick={() => setFilter('favorite')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                    filter === 'favorite'
                      ? 'bg-[#005f2a] text-white shadow-xs'
                      : 'bg-white border border-[#eceef0] text-[#3f493f] hover:bg-[#eceef0]'
                  }`}
                >
                  Favorites ({activities.filter((a) => a.type === 'favorite').length})
                </button>
                <button
                  onClick={() => setFilter('inquiry')}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer ${
                    filter === 'inquiry'
                      ? 'bg-[#005f2a] text-white shadow-xs'
                      : 'bg-white border border-[#eceef0] text-[#3f493f] hover:bg-[#eceef0]'
                  }`}
                >
                  Inquiries ({activities.filter((a) => a.type === 'inquiry').length})
                </button>
              </div>

              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <span className="material-symbols-outlined text-[#9ca3af] text-[48px]">history</span>
                  <p className="text-[14px] text-[#3f493f] font-medium">No activity recorded for this filter.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-[#005f2a]/20 ml-3 space-y-6 py-2">
                  {filteredActivities.map((act, index) => {
                    const dateFormatted = new Date(act.timestamp).toLocaleString();
                    return (
                      <div key={act.id || index} className="relative pl-6 group">
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#005f2a] ring-4 ring-white flex items-center justify-center text-white shadow-xs">
                          <span className="material-symbols-outlined text-[10px]">
                            {getTypeIcon(act.type)}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-[#eceef0] shadow-xs hover:shadow-md transition-all">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${getTypeBadgeColor(act.type)}`}>
                              {act.badgeText}
                            </span>
                            <span className="text-[11px] text-[#6f7a6e]">{dateFormatted}</span>
                          </div>
                          <h4 className="font-['Plus_Jakarta_Sans'] text-[14px] font-bold text-[#191c1e]">
                            {act.title}
                          </h4>
                          <p className="text-[12px] text-[#3f493f] mt-1 leading-relaxed">
                            {act.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* Insights Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#005f2a] to-[#0f7a3a] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="bg-white/20 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                    Verified Merchant Analytics
                  </span>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold mt-2">
                    Tomoca Coffee Roasters — Bole Flagship
                  </h3>
                  <p className="text-[13px] text-white/80 mt-0.5">
                    Real-time visitor engagement and conversion metrics across Addis Ababa directories.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/20">
                  <span className="text-[26px] font-extrabold block">4.8 ★</span>
                  <span className="text-[11px] text-white/90 font-medium">340 Verified Reviews</span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#eceef0] shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </div>
                  <span className="text-[12px] text-[#6f7a6e] font-semibold block">Total Profile Views</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-extrabold text-[#191c1e]">2,482</span>
                    <span className="text-[12px] font-bold text-[#005f2a]">+24% this week</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#eceef0] shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#005f2a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </div>
                  <span className="text-[12px] text-[#6f7a6e] font-semibold block">Clicks on 'Call'</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-extrabold text-[#191c1e]">194</span>
                    <span className="text-[12px] font-bold text-[#005f2a]">+12% this week</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#eceef0] shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">directions</span>
                  </div>
                  <span className="text-[12px] text-[#6f7a6e] font-semibold block">Get Directions Hits</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-extrabold text-[#191c1e]">312</span>
                    <span className="text-[12px] font-bold text-[#005f2a]">+31% this week</span>
                  </div>
                </div>
              </div>

              {/* 30-Day Engagement Peaks Sparkline Chart */}
              <div className="p-5 rounded-2xl bg-white border border-[#eceef0] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-[#191c1e] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#005f2a]">trending_up</span>
                      <span>30-Day Profile Engagement Peaks</span>
                    </h4>
                    <p className="text-[12px] text-[#6f7a6e]">
                      Daily visitor traffic, call clicks, and navigation direction requests over the past month.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#005f2a]/10 text-[#005f2a] text-[11px] font-bold">
                    Real-time Telemetry
                  </span>
                </div>

                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#005f2a" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#005f2a" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#191c1e',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area type="monotone" dataKey="views" name="Profile Views" stroke="#005f2a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                      <Area type="monotone" dataKey="calls" name="Call Clicks" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Engagement Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-[#eceef0] shadow-xs space-y-3">
                  <h4 className="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005f2a]">bookmark</span>
                    <span>Bookmark & Favorite Saves</span>
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9fc]">
                    <span className="text-[13px] text-[#3f493f] font-medium">Saved to User Favorites</span>
                    <span className="text-[14px] font-bold text-[#005f2a]">84 Clients</span>
                  </div>
                  <p className="text-[11px] text-[#6f7a6e]">
                    Users frequently bookmark your branch for weekend visits and corporate gifting.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#eceef0] shadow-xs space-y-3">
                  <h4 className="font-['Plus_Jakarta_Sans'] text-[15px] font-bold text-[#191c1e] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005f2a]">chat</span>
                    <span>Direct Inquiries & Quotes</span>
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9fc]">
                    <span className="text-[13px] text-[#3f493f] font-medium">B2B & Chat Messages</span>
                    <span className="text-[14px] font-bold text-[#005f2a]">19 Active Inquiries</span>
                  </div>
                  <p className="text-[11px] text-[#6f7a6e]">
                    Average response time: 24 minutes. 94% customer satisfaction rate.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f8f9fc] border-t border-[#eceef0] flex items-center justify-between">
          <span className="text-[11px] text-[#6f7a6e]">
            {activeMainTab === 'activity' ? 'Showing chronological user session history' : 'Verified merchant performance analytics'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
