import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BusinessSpot, QuoteRequest, ClaimRequest, ExpertInquiry } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Firestore error handler conforming to skill specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore as mandated by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    console.warn('Firestore connection notice (offline/unavailable):', error?.message || error);
    return false;
  }
}

// Trigger connection validation on startup
testConnection();

// Authentication helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In failed:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out failed:', error);
    throw error;
  }
}

// Business Data operations
export interface UserReview {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  photoUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function fetchBusinessReviews(businessId: string): Promise<UserReview[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'businesses', businessId, 'reviews'));
    const reviews: UserReview[] = [];
    querySnapshot.forEach((docSnap) => {
      reviews.push(docSnap.data() as UserReview);
    });
    return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Fetch reviews notice:', error);
    return [];
  }
}

export async function persistReview(
  businessId: string,
  rating: number,
  comment: string,
  userName: string,
  userPhoto?: string,
  photoUrl?: string
): Promise<{ newRating: number; newReviewCount: number; review: UserReview }> {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated to post a review');

  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const review: UserReview = {
    id: reviewId,
    businessId,
    userId: user.uid,
    userName: userName || user.displayName || 'Verified Citizen',
    userPhoto: userPhoto || user.photoURL || undefined,
    photoUrl: photoUrl || undefined,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  const docPath = `businesses/${businessId}/reviews/${reviewId}`;
  try {
    await setDoc(doc(db, 'businesses', businessId, 'reviews', reviewId), review);

    const existingReviews = await fetchBusinessReviews(businessId);
    const totalCount = existingReviews.length;
    const sumRatings = existingReviews.reduce((acc, r) => acc + r.rating, 0);
    const newAvg = Number((sumRatings / Math.max(1, totalCount)).toFixed(1));

    await updateBusinessDoc(businessId, {
      rating: newAvg,
      reviewCount: totalCount,
    });

    return {
      newRating: newAvg,
      newReviewCount: totalCount,
      review,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function persistBusiness(business: BusinessSpot): Promise<void> {
  const docPath = `businesses/${business.id}`;
  try {
    const cleanDoc: Record<string, any> = {
      ...business,
      updatedAt: new Date().toISOString(),
    };
    if (auth.currentUser?.uid) {
      cleanDoc.creatorId = auth.currentUser.uid;
    }
    await setDoc(doc(db, 'businesses', business.id), cleanDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Quote operations
export async function persistQuote(quote: QuoteRequest): Promise<string> {
  const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `quotes/${quoteId}`;
  try {
    const payload: Record<string, any> = {
      ...quote,
      id: quoteId,
      status: 'Under Evaluation',
      submittedAt: new Date().toISOString(),
    };
    if (auth.currentUser?.uid) {
      payload.senderId = auth.currentUser.uid;
    }
    await setDoc(doc(db, 'quotes', quoteId), payload);
    return quoteId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

// Claim operations
export async function persistClaim(claim: ClaimRequest): Promise<string> {
  const claimId = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `claims/${claimId}`;
  try {
    const payload: Record<string, any> = {
      ...claim,
      id: claimId,
      createdAt: new Date().toISOString(),
    };
    if (auth.currentUser?.uid) {
      payload.applicantId = auth.currentUser.uid;
    }
    await setDoc(doc(db, 'claims', claimId), payload);
    return claimId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export interface DataReportRequest {
  id?: string;
  businessId: string;
  businessName: string;
  issueType: string;
  description: string;
  userEmail?: string;
}

export async function persistDataReport(report: DataReportRequest): Promise<string> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `reports/${reportId}`;
  try {
    const payload: Record<string, any> = {
      ...report,
      id: reportId,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
    };
    if (auth.currentUser?.uid) {
      payload.userId = auth.currentUser.uid;
      payload.userEmail = auth.currentUser.email || undefined;
    }
    await setDoc(doc(db, 'reports', reportId), payload);
    return reportId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteBusinessDoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'businesses', id));
  } catch (error) {
    console.warn('Firestore deleteBusiness notice:', error);
  }
}

export async function updateBusinessDoc(id: string, updates: Partial<BusinessSpot>): Promise<void> {
  try {
    await setDoc(
      doc(db, 'businesses', id),
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore updateBusiness notice:', error);
  }
}

export async function updateClaimDoc(id: string, updates: Partial<ClaimRequest>): Promise<void> {
  try {
    await setDoc(
      doc(db, 'claims', id),
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore updateClaim notice:', error);
  }
}

export async function deleteClaimDoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'claims', id));
  } catch (error) {
    console.warn('Firestore deleteClaim notice:', error);
  }
}

export async function fetchUserFavorites(userId: string): Promise<string[]> {
  const colPath = `users/${userId}/favorites`;
  try {
    const q = collection(db, 'users', userId, 'favorites');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data().businessId as string);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
    return [];
  }
}

export async function addFavorite(userId: string, businessId: string): Promise<void> {
  const docPath = `users/${userId}/favorites/${businessId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'favorites', businessId), {
      id: businessId,
      userId,
      businessId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function removeFavorite(userId: string, businessId: string): Promise<void> {
  const docPath = `users/${userId}/favorites/${businessId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'favorites', businessId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export interface Promotion {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  category: string;
  discountBadge?: string;
  expiresAt: string;
  createdAt: string;
}

export async function fetchPromotions(): Promise<Promotion[]> {
  const colPath = 'promotions';
  try {
    const q = collection(db, 'promotions');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as Promotion);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
    return [];
  }
}

export async function createPromotion(promo: Omit<Promotion, 'id' | 'createdAt'>): Promise<string> {
  const promoId = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `promotions/${promoId}`;
  try {
    const payload: Promotion = {
      ...promo,
      id: promoId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'promotions', promoId), payload);
    return promoId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
    throw error;
  }
}

export async function deletePromotion(promoId: string): Promise<void> {
  const docPath = `promotions/${promoId}`;
  try {
    await deleteDoc(doc(db, 'promotions', promoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export interface Message {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  text: string;
  sender: 'user' | 'business';
  createdAt: string;
}

export async function fetchBusinessMessages(businessId: string): Promise<Message[]> {
  const colPath = `businesses/${businessId}/messages`;
  try {
    const q = collection(db, 'businesses', businessId, 'messages');
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as Message);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
    return [];
  }
}

export async function sendMessage(businessId: string, msg: Omit<Message, 'id' | 'createdAt'>): Promise<string> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `businesses/${businessId}/messages/${msgId}`;
  try {
    const payload: Message = {
      ...msg,
      id: msgId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'businesses', businessId, 'messages', msgId), payload);
    return msgId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
    throw error;
  }
}

export async function updateQuoteDoc(
  id: string,
  updates: Partial<QuoteRequest & { status?: string }>
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'quotes', id),
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore updateQuote notice:', error);
  }
}

export async function deleteQuoteDoc(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'quotes', id));
  } catch (error) {
    console.warn('Firestore deleteQuote notice:', error);
  }
}

export async function submitExpertInquiry(
  inquiry: Omit<ExpertInquiry, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docPath = `expertInquiries/${inquiryId}`;
  try {
    const payload: ExpertInquiry = {
      ...inquiry,
      id: inquiryId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'expertInquiries', inquiryId), payload);
    return inquiryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
    throw error;
  }
}

export async function fetchExpertInquiries(businessId?: string): Promise<ExpertInquiry[]> {
  const colPath = 'expertInquiries';
  try {
    const snapshot = await getDocs(collection(db, 'expertInquiries'));
    const list: ExpertInquiry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ExpertInquiry;
      if (!businessId || data.businessId === businessId) {
        list.push(data);
      }
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Fetch expert inquiries notice:', error);
    return [];
  }
}
