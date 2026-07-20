import { useQuery } from "@tanstack/react-query";
import { getCities, searchHotels, getHotelBySlug, getHotelReviews, getRoomAvailability } from "../api/hotel.api.js";

export const useCities = () =>
  useQuery({
    queryKey: ["cities"],
    queryFn: async () => (await getCities()).data.data.cities,
    staleTime: 10 * 60 * 1000,
  });

export const useHotelSearch = (params) =>
  useQuery({
    queryKey: ["hotels", params],
    queryFn: async () => (await searchHotels(params)).data.data,
    keepPreviousData: true,
  });

export const useHotelDetail = (slug, params) =>
  useQuery({
    queryKey: ["hotel", slug, params],
    queryFn: async () => (await getHotelBySlug(slug, params)).data.data,
    enabled: !!slug,
  });

export const useHotelReviews = (hotelId) =>
  useQuery({
    queryKey: ["hotel-reviews", hotelId],
    queryFn: async () => (await getHotelReviews(hotelId)).data.data.reviews,
    enabled: !!hotelId,
  });

// Live "X of Y available" for a specific slot — re-fetches whenever the
// caller's date/time/duration selection changes (pass a fresh queryKey).
export const useRoomAvailability = (roomId, { checkInDate, checkInTime, durationHrs }) =>
  useQuery({
    queryKey: ["room-availability", roomId, checkInDate, checkInTime, durationHrs],
    queryFn: async () => (await getRoomAvailability(roomId, { checkInDate, checkInTime, durationHrs })).data.data,
    enabled: !!roomId && !!checkInDate && !!checkInTime && !!durationHrs,
    staleTime: 15 * 1000,
  });

export default useHotelSearch;
