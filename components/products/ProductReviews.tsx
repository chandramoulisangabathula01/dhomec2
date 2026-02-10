"use client";

import { useState, useTransition } from "react";
import { createReview } from "@/app/actions/reviews";
import { Star, Send, User } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

export function ProductReviews({
  productId,
  reviews,
  isLoggedIn = false,
}: {
  productId: string;
  reviews: Review[];
  isLoggedIn?: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    startTransition(async () => {
      try {
        await createReview(productId, rating, comment);
        setComment("");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="mt-12 border-t border-slate-100 pt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Reviews</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-700">
              {avgRating.toFixed(1)} out of 5
            </span>
            <span className="text-sm text-slate-400">
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        </div>
      </div>

      {/* Write Review Form */}
      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Write a Review</h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    i <= (hoverRating || rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-slate-500">{rating}/5</span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={3}
            className="w-full p-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          <div className="flex items-center justify-between mt-3">
            {submitted && (
              <p className="text-sm text-emerald-600 font-medium">
                ✓ Review submitted successfully!
              </p>
            )}
            <button
              type="submit"
              disabled={isPending || !comment.trim()}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {!isLoggedIn && (
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            <a href="/login" className="text-blue-600 font-bold hover:underline">Log in</a> to write a review
          </p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-4 pb-6 border-b border-slate-50 last:border-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                {review.profiles?.avatar_url ? (
                  <img
                    src={review.profiles.avatar_url}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-slate-800">
                    {review.profiles?.full_name || "Customer"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(review.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
