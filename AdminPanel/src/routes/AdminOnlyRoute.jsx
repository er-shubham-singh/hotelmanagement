import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const AdminOnlyRoute = () => {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/hotels" replace />;
  return <Outlet />;
};

export default AdminOnlyRoute;
