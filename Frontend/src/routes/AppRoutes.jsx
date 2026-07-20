import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import Home from "../pages/Home.jsx";
import SearchResults from "../pages/SearchResults.jsx";
import HotelDetail from "../pages/HotelDetail.jsx";
import Booking from "../pages/Booking.jsx";
import BookingConfirmation from "../pages/BookingConfirmation.jsx";
import Login from "../pages/Login.jsx";
import Offers from "../pages/Offers.jsx";
import Partner from "../pages/Partner.jsx";
import About from "../pages/About.jsx";
import Contact from "../pages/Contact.jsx";
import Faqs from "../pages/Faqs.jsx";
import Terms from "../pages/Terms.jsx";
import Privacy from "../pages/Privacy.jsx";
import Careers from "../pages/Careers.jsx";
import AllCities from "../pages/AllCities.jsx";
import NotFound from "../pages/NotFound.jsx";

import DashboardLayout from "../pages/Dashboard/DashboardLayout.jsx";
import Profile from "../pages/Dashboard/Profile.jsx";
import MyBookings from "../pages/Dashboard/MyBookings.jsx";
import Wallet from "../pages/Dashboard/Wallet.jsx";
import Favourites from "../pages/Dashboard/Favourites.jsx";

const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="hotels/:slug" element={<HotelDetail />} />
      <Route path="login" element={<Login />} />
      <Route path="offers" element={<Offers />} />
      <Route path="partner" element={<Partner />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="faqs" element={<Faqs />} />
      <Route path="terms" element={<Terms />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="careers" element={<Careers />} />
      <Route path="all-cities" element={<AllCities />} />

      <Route element={<ProtectedRoute />}>
        <Route path="booking" element={<Booking />} />
        <Route path="booking-confirmation/:ref" element={<BookingConfirmation />} />
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="favourites" element={<Favourites />} />
        </Route>
      </Route>

      {/* Brevistay-style city URLs like /hotels-in-mumbai — must stay registered
          after all literal routes above; React Router ranks static segments higher
          than dynamic ones regardless of order, so this never shadows them. */}
      <Route path=":citySlug" element={<SearchResults />} />

      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AppRoutes;
