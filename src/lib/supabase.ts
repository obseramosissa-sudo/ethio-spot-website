import { createClient, User } from '@supabase/supabase-js';
import { BusinessSpot } from '../types';
import { INITIAL_BUSINESSES } from '../data/businesses';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client only if keys are present (using publishable anon key only)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Fetch businesses from Supabase 'businesses' table, with graceful fallback to local INITIAL_BUSINESSES.
 */
export async function fetchBusinessesFromSupabase(): Promise<BusinessSpot[]> {
  if (!supabase) {
    return INITIAL_BUSINESSES;
  }

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*');

    if (error) {
      console.warn('Supabase fetch businesses error (falling back to local):', error.message);
      return INITIAL_BUSINESSES;
    }

    if (!data || data.length === 0) {
      return INITIAL_BUSINESSES;
    }

    return data.map((item: any) => ({
      id: item.id || item.slug || Math.random().toString(36).substring(7),
      name: item.name,
      nameAmharic: item.name_amharic || item.nameAmharic || item.name,
      category: item.category || 'dining',
      categoryLabel: item.category_label || item.categoryLabel || 'Commercial Dining',
      subCategory: item.sub_category || item.subCategory || item.district || 'Addis Ababa',
      district: item.district || 'Bole Medhanialem & Atlas',
      address: item.address || 'Addis Ababa, Ethiopia',
      addressAmharic: item.address_amharic || item.addressAmharic || 'አዲስ አበባ፣ ኢትዮጵያ',
      licenseNumber: item.license_number || item.licenseNumber || 'MoT-000000',
      licenseType: item.license_type || item.licenseType || 'MoT Verified',
      isOpen: item.is_open ?? item.isOpen ?? true,
      hours: item.hours || '8:00 AM - 8:00 PM',
      rating: item.rating || 4.7,
      reviewCount: item.review_count || item.reviewCount || 10,
      distanceKm: item.distance_km || item.distanceKm || 1.0,
      priceRange: item.price_range || item.priceRange || '100 - 500 ETB',
      imageUrl: item.image_url || item.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      tags: item.tags || ['Verified Merchant'],
      paymentMethods: item.payment_methods || item.paymentMethods || ['Telebirr'],
      phone: item.phone || '+251 911 000 000',
      telegram: item.telegram || '@EthioSpotMerchant',
      description: item.description || 'Verified merchant registered on EthioSpot commercial network.',
      lat: item.lat || 9.0054,
      lng: item.lng || 38.7469,
      features: item.features || ['Verified', 'POS Ready'],
    }));
  } catch (err) {
    console.warn('Exception fetching from Supabase:', err);
    return INITIAL_BUSINESSES;
  }
}

/**
 * Supabase Authentication Helpers
 */
export async function signInWithSupabaseEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithSupabaseEmail(email: string, password: string) {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutSupabase() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Save a business to Supabase 'businesses' table.
 */
export async function saveBusinessToSupabase(business: BusinessSpot): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not initialized.' };
  }

  try {
    const row = {
      id: business.id,
      name: business.name,
      name_amharic: business.nameAmharic,
      category: business.category,
      category_label: business.categoryLabel,
      sub_category: business.subCategory,
      district: business.district,
      address: business.address,
      license_number: business.licenseNumber,
      license_type: business.licenseType,
      is_open: business.isOpen,
      hours: business.hours,
      rating: business.rating,
      review_count: business.reviewCount,
      distance_km: business.distanceKm,
      price_range: business.priceRange,
      image_url: business.imageUrl,
      tags: business.tags,
      payment_methods: business.paymentMethods,
      phone: business.phone,
      telegram: business.telegram,
      description: business.description,
      lat: business.lat,
      lng: business.lng,
      features: business.features,
    };

    const { error } = await supabase
      .from('businesses')
      .upsert(row);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save business to Supabase.' };
  }
}


/**
 * Fetch additional photos for a business from Supabase 'business_images' table.
 */
export async function fetchBusinessImagesFromSupabase(businessId: string): Promise<string[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('business_images')
      .select('*')
      .or(`business_id.eq.${businessId},businessId.eq.${businessId}`);

    if (error || !data) {
      return [];
    }
    return data.map((item: any) => {
      if (typeof item === 'string') return item;
      return item.image_url || item.imageUrl || item.url || item.photo_url || item.image || item.path || '';
    }).filter((url): url is string => Boolean(url && typeof url === 'string'));
  } catch (err) {
    console.warn('Error fetching business_images from Supabase:', err);
    return [];
  }
}

/**
 * Save an image to Supabase 'business_images' table.
 */
export async function saveBusinessImageToSupabase(businessId: string, imageUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not initialized.' };
  }
  try {
    const { error } = await supabase
      .from('business_images')
      .insert({
        business_id: businessId,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save image to Supabase.' };
  }
}
