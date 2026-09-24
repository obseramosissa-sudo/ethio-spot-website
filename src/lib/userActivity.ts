export interface UserActivityItem {
  id: string;
  type: 'review' | 'favorite' | 'inquiry';
  title: string;
  subtitle: string;
  timestamp: string;
  badgeText: string;
  businessId?: string;
  details?: any;
}

export function logUserActivity(item: Omit<UserActivityItem, 'id' | 'timestamp'>) {
  try {
    const existing = getUserActivities();
    const newItem: UserActivityItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    const updated = [newItem, ...existing].slice(0, 50);
    localStorage.setItem('ethiospot_user_activities', JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to log user activity:', err);
  }
}

export function getUserActivities(): UserActivityItem[] {
  try {
    const raw = localStorage.getItem('ethiospot_user_activities');
    if (!raw) {
      return [
        {
          id: 'act-1',
          type: 'favorite',
          title: 'Saved to Favorites',
          subtitle: 'Tomoca Coffee Roasters — Flagship Bole Branch',
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          badgeText: 'Bookmark',
        },
        {
          id: 'act-2',
          type: 'inquiry',
          title: 'Submitted B2B Quote Request',
          subtitle: 'Inquiry for Bulk Export Packaging & Specialty Coffee Beans',
          timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
          badgeText: 'Quote Request',
        },
        {
          id: 'act-3',
          type: 'review',
          title: 'Posted 5-Star Verified Review',
          subtitle: 'Boston Day Spa — "Incredible therapeutic steam and professional staff."',
          timestamp: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
          badgeText: 'Review (★ 5.0)',
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
