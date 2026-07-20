import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/AdminLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminOnlyRoute from "./AdminOnlyRoute.jsx";

import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Hotels from "../pages/Hotels.jsx";
import HotelRooms from "../pages/HotelRooms.jsx";
import Cities from "../pages/Cities.jsx";
import Offers from "../pages/Offers.jsx";
import Bookings from "../pages/Bookings.jsx";
import Leads from "../pages/Leads.jsx";
import Users from "../pages/Users.jsx";
import AuditLog from "../pages/AuditLog.jsx";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AdminLayout />}>
        {/* Scoped inside their controllers: admin sees everything, hotelOwner sees only their own hotels. */}
        <Route index element={<Dashboard />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:slug/rooms" element={<HotelRooms />} />
        <Route path="/bookings" element={<Bookings />} />

        <Route element={<AdminOnlyRoute />}>
          <Route path="/cities" element={<Cities />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/users" element={<Users />} />
          <Route path="/audit-log" element={<AuditLog />} />
        </Route>
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
