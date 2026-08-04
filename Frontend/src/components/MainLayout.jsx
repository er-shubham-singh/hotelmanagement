import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import NotificationPermissionBanner from "./NotificationPermissionBanner.jsx";
import ReviewPrompt from "./ReviewPrompt.jsx";

const MainLayout = () => (
  <div className="flex min-h-screen flex-col bg-bg">
    <Navbar />
    <NotificationPermissionBanner />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <ReviewPrompt />
  </div>
);

export default MainLayout;
