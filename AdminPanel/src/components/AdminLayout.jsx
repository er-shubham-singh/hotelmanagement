import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const TITLES = [
  { test: (p) => p === "/", title: "Dashboard" },
  { test: (p) => p.startsWith("/hotels/") && p.endsWith("/rooms"), title: "Manage Rooms" },
  { test: (p) => p === "/hotels", title: "Hotels" },
  { test: (p) => p === "/cities", title: "Cities" },
  { test: (p) => p === "/offers", title: "Offers" },
  { test: (p) => p === "/bookings", title: "Bookings" },
  { test: (p) => p === "/leads", title: "Partner Leads" },
  { test: (p) => p === "/users", title: "Users" },
  { test: (p) => p === "/audit-log", title: "Audit Log" },
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const title = TITLES.find((t) => t.test(pathname))?.title || "Dashboard";

  return (
    <div className="flex bg-bg">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <Topbar title={title} onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
