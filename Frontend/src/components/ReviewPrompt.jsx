import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth.js";
import { useSocketEvent } from "../hooks/useSocket.js";
import { getMyReviews } from "../api/review.api.js";
import { getBookingById } from "../api/booking.api.js";
import ReviewModal from "./ReviewModal.jsx";

// Mounted once in MainLayout so it fires no matter which page the user is on
// when a booking flips to COMPLETED (self-checkout, admin-verified checkout,
// or a fine payment finishing the stay) — the socket event only carries a
// bookingId, so this looks the booking + hotel up before deciding to prompt.
const ReviewPrompt = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState(null); // { hotel, bookingId }

  const { data: myReviews } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => (await getMyReviews()).data.data.reviews,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });

  useSocketEvent(
    "booking:statusUpdate",
    async (payload) => {
      if (!isAuthenticated || payload?.status !== "COMPLETED") return;
      try {
        const { data } = await getBookingById(payload.bookingId);
        const booking = data.data.booking;
        const hotel = booking.hotel;
        if (!hotel) return;
        const alreadyReviewed = myReviews?.some((r) => r.hotel?._id === hotel._id);
        if (alreadyReviewed) return;
        setPrompt({ hotel, bookingId: booking._id });
      } catch (error) {
        // Non-critical UX feature — never let a lookup failure surface an error toast.
      }
    },
    [isAuthenticated, myReviews]
  );

  if (!prompt) return null;

  return (
    <ReviewModal
      isOpen
      onClose={() => setPrompt(null)}
      hotel={prompt.hotel}
      bookingId={prompt.bookingId}
      onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["my-reviews"] })}
    />
  );
};

export default ReviewPrompt;
