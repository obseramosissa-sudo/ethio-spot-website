import { BusinessSpot } from '../types';

export const ACCESSIBILITY_OPTIONS = [
  'Wheelchair Access',
  'Dedicated Accessible Parking',
  'Braille Signage',
  'Ramp Entry',
  'Accessible Restroom',
  'Elevator Access',
  'Sign Language Support',
] as const;

export function getAccessibilityScore(business: BusinessSpot): {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'Basic';
  badgeColor: string;
  matchedFeatures: string[];
} {
  const features = business.accessibilityFeatures || [];
  const generalFeatures = business.features || [];

  // Count reported accessibility features
  let count = features.length;
  generalFeatures.forEach((f) => {
    const lower = f.toLowerCase();
    if (
      (lower.includes('wheelchair') ||
        lower.includes('ramp') ||
        lower.includes('parking') ||
        lower.includes('braille') ||
        lower.includes('elevator') ||
        lower.includes('restroom')) &&
      !features.includes(f as any)
    ) {
      count++;
    }
  });

  const score = Math.min(100, Math.round((Math.max(count, features.length, 1) / 5) * 100));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'Basic' = 'Basic';
  let badgeColor = 'bg-gray-100 text-gray-700 border-gray-200';

  if (score >= 90) {
    grade = 'A+';
    badgeColor = 'bg-[#005f2a]/10 text-[#005f2a] border-[#005f2a]/30';
  } else if (score >= 75) {
    grade = 'A';
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (score >= 50) {
    grade = 'B';
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (score >= 25) {
    grade = 'C';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const matchedFeatures = Array.from(
    new Set([...features, ...generalFeatures.filter((f) => {
      const l = f.toLowerCase();
      return l.includes('wheelchair') || l.includes('ramp') || l.includes('parking') || l.includes('braille') || l.includes('elevator');
    })])
  );

  return {
    score,
    grade,
    badgeColor,
    matchedFeatures,
  };
}
