'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { getSocket } from '@/lib/socket';
import api from '@/lib/axios';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Camera, 
  Loader2, 
  AlertTriangle,
  Pin,
  Bookmark
} from 'lucide-react';
import { optimizeImageUrl } from '@/lib/image';

interface Review {
  _id: string;
  userName: string;
  userProfileImage?: string;
  rating: number;
  reviewTitle?: string;
  reviewDescription: string;
  reviewImages?: string[];
  reviewVideos?: string[];
  isVerifiedPurchase: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: string;
  adminReply?: {
    message: string;
    repliedAt: string;
  };
}

interface ProductReviewsProps {
  productId: string;
  onStatsChange?: (stats: { totalReviews: number; averageRating: number }) => void;
}

export default function ProductReviews({ productId, onStatsChange }: ProductReviewsProps) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>({ totalReviews: 0, averageRating: 0, ratingBreakdown: {} });
  const [loading, setLoading] = useState(true);
  
  // Eligibility check
  const [isEligible, setIsEligible] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch reviews & stats
  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/api/products/${productId}/reviews`);
      setReviews(data.reviews || []);
      const newStats = data.stats || { totalReviews: 0, averageRating: 0, ratingBreakdown: {} };
      setStats(newStats);
      if (onStatsChange) {
        onStatsChange({
          totalReviews: newStats.totalReviews || 0,
          averageRating: newStats.averageRating || 0
        });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Check customer review eligibility
  const checkEligibility = async () => {
    if (!isAuthenticated) return;
    setCheckingEligibility(true);
    try {
      const { data } = await api.get('/api/orders/myorders');
      const hasDeliveredProduct = data.some((order: any) => 
        order.orderStatus === 'Delivered' && 
        order.products.some((p: any) => p.product?._id === productId || p.product === productId)
      );
      setIsEligible(hasDeliveredProduct);
    } catch (err) {
      console.error('Eligibility check error:', err);
    } finally {
      setCheckingEligibility(false);
    }
  };

  // 3. Socket.IO Real-time Synchronization
  useEffect(() => {
    fetchReviews();
    checkEligibility();

    const socket = getSocket();
    socket.connect();
    socket.emit('join_room', `product_${productId}`);

    socket.on('new_review', (newReview: Review) => {
      setReviews(prev => {
        if (prev.some(r => r._id === newReview._id)) return prev;
        const list = [newReview, ...prev];
        return list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      });
      recalculateStats(newReview, 'add');
    });

    socket.on('review_updated', (updatedReview: Review) => {
      setReviews(prev => prev.map(r => r._id === updatedReview._id ? updatedReview : r)
        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      );
    });

    socket.on('review_deleted', (deletedId: string) => {
      setReviews(prev => {
        const removed = prev.find(r => r._id === deletedId);
        if (removed) recalculateStats(removed, 'remove');
        return prev.filter(r => r._id !== deletedId);
      });
    });

    return () => {
      socket.emit('leave_room', `product_${productId}`);
      socket.off('new_review');
      socket.off('review_updated');
      socket.off('review_deleted');
    };
  }, [productId, isAuthenticated]);

  const recalculateStats = (review: Review, action: 'add' | 'remove') => {
    setStats((prev: any) => {
      let total = prev.totalReviews || 0;
      let sum = (prev.averageRating || 0) * total;
      let breakdown = prev.ratingBreakdown 
        ? { ...prev.ratingBreakdown } 
        : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      const ratingKey = Math.round(review.rating) as 5 | 4 | 3 | 2 | 1;

      if (action === 'add') {
        total += 1;
        sum += review.rating;
        breakdown[ratingKey] = (breakdown[ratingKey] || 0) + 1;
      } else {
        total = Math.max(0, total - 1);
        sum = Math.max(0, sum - review.rating);
        breakdown[ratingKey] = Math.max(0, (breakdown[ratingKey] || 0) - 1);
      }

      const updated = {
        totalReviews: total,
        averageRating: total > 0 ? Number((sum / total).toFixed(1)) : 0,
        ratingBreakdown: breakdown
      };

      if (onStatsChange) {
        onStatsChange({
          totalReviews: updated.totalReviews,
          averageRating: updated.averageRating
        });
      }

      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    setErrorMsg('');
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImages(prev => [...prev, data.url]);
      setSuccessMsg('Image uploaded successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      setErrorMsg('Please write your review thoughts.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post(`/api/products/${productId}/reviews`, {
        rating,
        reviewTitle: title,
        reviewDescription: description,
        reviewImages: images
      });

      setSuccessMsg('Your review has been submitted.');
      setRating(5);
      setTitle('');
      setDescription('');
      setImages([]);
      setShowForm(false);
      checkEligibility();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-[#D5D0CA] dark:border-[#2A2A2A] pt-14 mt-14">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-[11px] uppercase font-[family-name:var(--font-heading)] font-medium tracking-[0.2em] text-[#C41E24] block mb-1">
            Customer Feedback
          </span>
          <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-heading)] font-bold tracking-tight text-foreground">
            Verified Reviews
          </h2>
        </div>
        
        {isAuthenticated && isEligible && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-[#C41E24] text-white px-5 py-2.5 text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-[0.15em] hover:bg-[#a01a1f] transition-colors flex items-center gap-2 cursor-pointer w-max"
          >
            <MessageSquare size={13} />
            <span>Write a Review</span>
          </button>
        )}
        
        {isAuthenticated && !isEligible && !checkingEligibility && (
          <div className="flex items-center space-x-2 text-xs font-[family-name:var(--font-body)] text-[#8A8580]">
            <AlertTriangle size={14} className="text-[#C41E24]" />
            <span>Only verified buyers can review this piece.</span>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] mb-10">
          <div className="flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-[#D5D0CA] dark:border-[#2A2A2A] py-4 md:py-0 md:pr-6">
            <h3 className="text-4xl md:text-5xl font-[family-name:var(--font-body)] font-bold text-foreground leading-none">{stats.averageRating}</h3>
            <div className="flex text-[#C41E24] mt-3 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(stats.averageRating) ? "fill-[#C41E24]" : "text-[#D5D0CA] dark:text-[#2A2A2A]"} />
              ))}
            </div>
            <span className="text-xs font-[family-name:var(--font-body)] text-[#8A8580]">{stats.totalReviews} total ratings</span>
          </div>

          <div className="col-span-2 space-y-2 py-2">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = stats.ratingBreakdown?.[stars] || 0;
              const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center text-xs font-[family-name:var(--font-body)] text-[#8A8580] gap-3">
                  <span className="w-12 text-right">{stars} star</span>
                  <div className="flex-1 h-1.5 bg-[#D5D0CA] dark:bg-[#2A2A2A] overflow-hidden">
                    <div className="h-full bg-[#C41E24]" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-left">{Math.round(percent)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] p-6 mb-10 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#D5D0CA] dark:border-[#2A2A2A]">
            <h3 className="text-sm font-[family-name:var(--font-heading)] font-bold uppercase tracking-wider text-foreground">Add Your Review</h3>
            <button 
              type="button" 
              onClick={() => { setShowForm(false); setErrorMsg(''); }}
              className="text-xs font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580] hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#C41E24] text-xs font-[family-name:var(--font-body)]">{errorMsg}</div>}
          {successMsg && <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-[family-name:var(--font-body)]">{successMsg}</div>}

          <div className="space-y-1">
            <label className="block text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580]">Overall Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="cursor-pointer"
                >
                  <Star size={20} className={star <= rating ? "fill-[#C41E24] text-[#C41E24]" : "text-[#D5D0CA] dark:text-[#2A2A2A]"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580]">Title (Optional)</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summary of your thoughts"
              className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] px-4 py-2.5 text-foreground outline-none text-xs font-[family-name:var(--font-body)]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580]">Review</label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How is the cut, fabric weight, and durability?"
              className="w-full bg-background border border-[#D5D0CA] dark:border-[#2A2A2A] focus:border-[#C41E24] px-4 py-2.5 text-foreground outline-none text-xs font-[family-name:var(--font-body)] resize-none"
              required
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#8A8580]">Attach Photos</label>
            <div className="flex flex-wrap gap-2 items-center">
              {images.map((img, i) => (
                <div key={i} className="w-16 h-20 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] overflow-hidden relative">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-black text-white px-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="w-16 h-20 border border-dashed border-[#D5D0CA] dark:border-[#2A2A2A] hover:border-foreground flex flex-col items-center justify-center cursor-pointer transition-colors">
                  {uploading ? (
                    <Loader2 className="animate-spin text-[#8A8580]" size={16} />
                  ) : (
                    <>
                      <Camera size={16} className="text-[#8A8580]" />
                      <span className="text-[8px] font-[family-name:var(--font-heading)] uppercase mt-1 text-[#8A8580]">Upload</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    disabled={uploading} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#C41E24] text-white px-6 py-2.5 text-xs font-[family-name:var(--font-heading)] font-semibold uppercase tracking-[0.15em] hover:bg-[#a01a1f] transition-colors flex items-center justify-center cursor-pointer"
            >
              {submitting && <Loader2 className="animate-spin mr-2" size={13} />}
              <span>Post Review</span>
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#C41E24] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div 
              key={review._id} 
              className={`p-6 border ${
                review.isPinned ? 'border-[#C41E24] bg-surface' : 'border-[#D5D0CA] dark:border-[#2A2A2A] bg-background'
              } space-y-3`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#D5D0CA] dark:border-[#2A2A2A]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] overflow-hidden flex items-center justify-center text-xs font-semibold font-[family-name:var(--font-heading)]">
                    {review.userProfileImage ? (
                      <img src={review.userProfileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      review.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-[family-name:var(--font-heading)] font-semibold text-xs text-foreground">{review.userName}</span>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center text-[9px] font-[family-name:var(--font-heading)] uppercase text-green-600 bg-green-600/10 px-1.5 py-0.5">
                          <CheckCircle2 size={10} className="mr-1" /> Verified
                        </span>
                      )}
                      {review.isPinned && (
                        <span className="flex items-center text-[9px] font-[family-name:var(--font-heading)] uppercase text-[#C41E24] bg-[#C41E24]/10 px-1.5 py-0.5">
                          <Pin size={10} className="mr-1" /> Pinned
                        </span>
                      )}
                      {review.isFeatured && (
                        <span className="flex items-center text-[9px] font-[family-name:var(--font-heading)] uppercase text-foreground bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] px-1.5 py-0.5">
                          <Bookmark size={10} className="mr-1" /> Featured
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8A8580] font-[family-name:var(--font-body)] block mt-0.5">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex text-[#C41E24]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < review.rating ? "fill-[#C41E24]" : "text-[#D5D0CA] dark:text-[#2A2A2A]"} />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                {review.reviewTitle && (
                  <h4 className="font-[family-name:var(--font-heading)] font-semibold text-sm text-foreground">{review.reviewTitle}</h4>
                )}
                <p className="font-[family-name:var(--font-body)] text-xs text-foreground/80 leading-relaxed">
                  {review.reviewDescription}
                </p>
              </div>

              {review.reviewImages && review.reviewImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {review.reviewImages.map((img, i) => (
                    <div key={i} className="w-16 h-20 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A] overflow-hidden">
                      <img src={optimizeImageUrl(img, 160)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {review.adminReply && (
                <div className="bg-surface border-l-2 border-[#C41E24] p-3 space-y-1 font-[family-name:var(--font-body)] mt-3">
                  <div className="flex justify-between items-center text-[10px] font-[family-name:var(--font-heading)] uppercase tracking-wider text-[#C41E24]">
                    <span>Redsee Response</span>
                    <span className="text-[#8A8580] font-normal">{new Date(review.adminReply.repliedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    "{review.adminReply.message}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface border border-[#D5D0CA] dark:border-[#2A2A2A]">
          <p className="text-[#8A8580] text-xs font-[family-name:var(--font-body)] mb-3">No reviews yet for this piece.</p>
          {isAuthenticated && isEligible && (
            <button 
              onClick={() => setShowForm(true)}
              className="border border-[#C41E24] text-[#C41E24] hover:bg-[#C41E24] hover:text-white px-4 py-2 text-xs font-[family-name:var(--font-heading)] uppercase tracking-[0.15em] transition-colors"
            >
              Write First Review
            </button>
          )}
        </div>
      )}
    </div>
  );
}
