import { useState } from "react";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";
import { createReview, updateReview } from "../api/review.api.js";

// Used both for the automatic post-checkout popup and the "Write/Edit a
// Review" action in My Bookings — pass `existingReview` to switch to edit mode.
const ReviewModal = ({ isOpen, onClose, hotel, bookingId, existingReview, onSubmitted }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a star rating");
      return;
    }
    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateReview(existingReview._id, { rating, comment });
        toast.success("Review updated");
      } else {
        await createReview({ hotelId: hotel._id, bookingId, rating, comment });
        toast.success("Thanks for your review!");
      }
      onSubmitted?.();
      onClose();
    } catch (error) {
      // handled by the axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingReview ? "Edit your review" : "How was your stay?"}>
      {hotel && (
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <img
            src={hotel.images?.[0] || `https://picsum.photos/seed/staybyhour-hotel-${hotel.slug || hotel._id}/120/120`}
            alt=""
            aria-hidden="true"
            className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
          />
          <p className="font-medium text-text">{hotel.name}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            className="p-1"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverRating || rating) ? "fill-accent text-accent" : "fill-transparent text-border"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell other travelers about your stay (optional)"
        rows={4}
        maxLength={1000}
        className="input mt-4 resize-none"
      />

      <Button className="mt-4 w-full" variant="accent" isLoading={isSubmitting} onClick={handleSubmit}>
        {existingReview ? "Update Review" : "Submit Review"}
      </Button>
    </Modal>
  );
};

export default ReviewModal;
