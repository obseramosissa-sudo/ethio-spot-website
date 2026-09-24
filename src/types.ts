export type NavigationTab = 'discover' | 'categories' | 'map-view' | 'compare' | 'favorites' | 'following' | 'add-business' | 'claims' | 'admin';

export type District =
  | 'All Commercial Districts'
  | 'Bole Medhanialem & Atlas'
  | 'Kazanchis & UNECA Area'
  | 'Megenagna & CMC'
  | 'Piazza & Arat Kilo'
  | 'Sarbet & Bisrate Gabriel'
  | 'Mercato & Kirkos';

export type CategoryId =
  | 'dining'
  | 'coffee'
  | 'tech'
  | 'health'
  | 'hotels'
  | 'wellness'
  | 'auto'
  | 'crafts'
  | 'construction'
  | 'finance'
  | 'freight'
  | 'legal';

export interface BusinessSpot {
  id: string;
  name: string;
  nameAmharic: string;
  category: CategoryId;
  categoryLabel: string;
  subCategory: string;
  district: District;
  address: string;
  addressAmharic?: string;
  licenseNumber: string;
  licenseType: 'MoT Verified' | 'EFDA Licensed' | 'Fair Trade & MoT' | 'Pending Verification';
  isOpen: boolean;
  hours: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  priceRange: string;
  imageUrl: string;
  galleryImages?: string[];
  tags: string[];
  paymentMethods: ('Telebirr' | 'CBE Birr' | 'POS Card' | 'Bank Transfer' | 'Visa / Mastercard' | 'Telebirr SuperApp')[];
  phone: string;
  telegram?: string;
  whatsapp?: string;
  description: string;
  lat: number;
  lng: number;
  features: string[];
  featured?: boolean;
  creatorId?: string;
  bannerTitle?: string;
  specialAction?: {
    label: string;
    type: 'menu' | 'stock' | 'catalog' | 'tour';
  };
  faqs?: {
    question: string;
    answer: string;
  }[];
  accessibilityFeatures?: string[];
}

export interface QuoteRequest {
  id?: string;
  businessId?: string;
  businessName?: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  quantityNotes: string;
  organization: string;
  urgency: 'Immediate (24-48h)' | 'Standard (1-2 weeks)' | 'Bulk / Tender';
  status?: string;
  submittedAt?: string;
}

export interface ClaimRequest {
  id?: string;
  businessName: string;
  licenseNumber: string;
  tinNumber: string;
  applicantName: string;
  role: string;
  applicantPhone: string;
  idDocumentName?: string;
  status: 'Under MoT Verification' | 'Approved' | 'Reviewing';
  submittedAt: string;
}

export interface ExpertInquiry {
  id: string;
  businessId: string;
  businessName: string;
  userName: string;
  userEmail?: string;
  question: string;
  department: 'Licensing & Compliance' | 'Product & Pricing' | 'Bulk Orders & Logistics' | 'General Inquiry';
  status: 'pending' | 'answered';
  answer?: string;
  createdAt: string;
}
