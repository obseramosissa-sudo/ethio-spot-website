import React, { useState, useEffect } from 'react';
import { BusinessSpot } from '../types';
import { UserReview, fetchBusinessReviews, persistReview } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { CameraCaptureModal } from './CameraCaptureModal';

interface BusinessReviewsTabProps {
  business: BusinessSpot;
  onRatingUpdated: (newRating: number, newReviewCount: number) => void;
}

export const BusinessReviewsTab: React.FC<BusinessReviewsTabProps> = ({
  business,
  onRatingUpdated,
}) => {
  const { user, signIn } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setLoading(true);
      try {
        const data = await fetchBusinessReviews(business.id);
        if (isMounted) {
          setReviews(data);
        }
      } catch (err) {
        console.warn('Failed to load reviews:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [business.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in with Google to post a verified review.');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a short review comment.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(false);

    try {
      const result = await persistReview(
        business.id,
        rating,
        comment.trim(),
        user.displayName || 'Verified Citizen',
        user.photoURL || undefined,
        reviewPhotoUrl || undefined
      );

      setReviews([result.review, ...reviews]);
      onRatingUpdated(result.newRating, result.newReviewCount);
      setComment('');
      setRating(5);
      setReviewPhotoUrl(null);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      console.error('Error posting review:', err);
      setError(err?.message || 'Failed to post review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Header Box */}
      <div className="p-4 rounded-2xl bg-[#f2f6f3] border border-[#d8e3d8] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#005f2a] text-white flex flex-col items-center justify-center font-bold shadow-sm">
            <span className="text-[20px] leading-none">{business.rating}</span>
            <span className="text-[10px] text-white/80 mt-0.5">/ 5.0</span>
          </div>
          <div>
            <h4 className="font-bold text-[15px] text-[#191c1e]">Verified Consumer Ratings</h4>
            <p className="text-[12px] text-[#3f493f]">
              Based on {business.reviewCount} verified local reviews in Addis Ababa
            </p>
          </div>
        </div>

        <div className="flex items-center text-[#fdc002]">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: star <= Math.round(business.rating) ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
          ))}
        </div>
      </div>

      {/* Post a Review Form */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e2e8e2] shadow-2xs space-y-4">
        <h5 className="font-bold text-[14px] text-[#191c1e] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#005f2a] text-[18px]">rate_review</span>
          <span>Leave a Verified Review</span>
        </h5>

        {!user ? (
          <div className="p-4 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-center space-y-3">
            <p className="text-[13px] text-[#3f493f]">
              Sign in with your Google account to post a star rating and verified text review for {business.name}.
            </p>
            <button
              type="button"
              onClick={signIn}
              className="px-4 py-2 rounded-xl bg-[#005f2a] text-white text-[13px] font-semibold hover:bg-[#0f7a3a] transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Sign in with Google</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px]">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-[#97f8a9]/20 border border-[#7bdb8f] text-[#005324] text-[12px] font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Review posted successfully and average rating recalculated!</span>
              </div>
            )}

            {/* Star Rating Picker */}
            <div>
              <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider mb-1.5">
                Your Star Rating
              </label>
              <div className="flex items-center gap-1 text-[#fdc002]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[28px]"
                      style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
                <span className="ml-2 text-[14px] font-bold text-[#191c1e]">{rating}.0 / 5.0</span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-bold text-[#6f7a6e] uppercase tracking-wider">
                  Your Review & Experience
                </label>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="text-[12px] text-[#005f2a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  <span>{reviewPhotoUrl ? 'Retake Photo' : 'Capture Photo'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (e.g. service quality, pricing, speed, payment channels like Telebirr)..."
                className="w-full p-3 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] placeholder:text-[#9ca3af] outline-none focus:border-[#005f2a] transition-colors resize-none"
              />

              {reviewPhotoUrl && (
                <div className="mt-2.5 relative inline-block">
                  <img
                    src={reviewPhotoUrl}
                    alt="Review Capture"
                    className="w-24 h-24 rounded-xl object-cover border border-[#eceef0] shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setReviewPhotoUrl(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[12px] shadow cursor-pointer"
                    title="Remove photo"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-[12px] text-[#6f7a6e]">
                {user.photoURL && (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full object-cover" />
                )}
                <span>Posting as <strong>{user.displayName || 'Verified Citizen'}</strong></span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] disabled:opacity-50 text-white text-[13px] font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <h5 className="font-bold text-[14px] text-[#191c1e] flex items-center justify-between">
          <span>Community Reviews ({reviews.length})</span>
          <span className="text-[12px] text-[#6f7a6e] font-normal">Real-time Firestore sync</span>
        </h5>

        {loading ? (
          <div className="py-8 text-center text-[#6f7a6e] text-[13px]">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#f8f9fc] border border-[#eceef0] text-[#6f7a6e] text-[13px]">
            No custom reviews yet. Be the first to share your experience with {business.name}!
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white border border-[#eceef0] shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#005f2a]/10 text-[#005f2a] font-bold text-[13px] flex items-center justify-center overflow-hidden">
                      {rev.userPhoto ? (
                        <img src={rev.userPhoto} alt={rev.userName} className="w-full h-full object-cover" />
                      ) : (
                        rev.userName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h6 className="font-bold text-[13px] text-[#191c1e]">{rev.userName}</h6>
                      <span className="text-[11px] text-[#6f7a6e]">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-[#fdc002]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: s <= rev.rating ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[13px] text-[#3f493f] leading-relaxed pl-10.5">
                  {rev.comment}
                </p>

                {rev.photoUrl && (
                  <div className="pl-10.5 pt-2">
                    <img
                      src={rev.photoUrl}
                      alt="Review Attachment"
                      className="w-32 h-32 rounded-xl object-cover border border-[#eceef0] shadow-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(url) => setReviewPhotoUrl(url)}
        title="Capture Review Photo"
      />
    </div>
  );
};
