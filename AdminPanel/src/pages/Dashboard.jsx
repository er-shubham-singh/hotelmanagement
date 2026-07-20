import { useQuery } from "@tanstack/react-query";
import { Users, Building2, CalendarCheck, Tag, Inbox, IndianRupee, PieChart, AlertTriangle, LogIn, LogOut } from "lucide-react";
import Loader from "../common/Loader.jsx";
import { getStats } from "../api/admin.api.js";
import { useAuth } from "../hooks/useAuth.js";

const StatCard = ({ icon: Icon, label, value, tone = "primary" }) => (
  <div className="card flex items-center gap-4 p-5">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone === "danger" ? "bg-danger/10 text-danger" : "bg-primary-light text-primary"}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm text-text-muted">{label}</p>
      <p className="font-heading text-2xl font-bold text-text">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await getStats()).data.data,
  });

  if (isLoading) return <Loader fullscreen label="Loading dashboard…" />;

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin && <StatCard icon={Users} label="Total Guests" value={data.totalUsers} />}
        <StatCard icon={Building2} label="Active Hotels" value={data.totalHotels} />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={data.totalBookings} />
        {isAdmin && <StatCard icon={Tag} label="Active Offers" value={data.activeOffers} />}
        {isAdmin && <StatCard icon={Inbox} label="New Partner Leads" value={data.newLeads} />}
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${data.totalRevenue.toLocaleString("en-IN")}`} />
        <StatCard icon={LogIn} label="Today's Check-ins" value={data.todayCheckIns} />
        <StatCard icon={LogOut} label="Today's Check-outs" value={data.todayCheckOuts} />
        <StatCard icon={AlertTriangle} label="Pending Penalties" value={`₹${(data.pendingPenalties || 0).toLocaleString("en-IN")}`} tone="danger" />
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-base font-semibold text-text">Live Occupancy</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${data.occupancy?.percent || 0}%` }} />
          </div>
          <p className="whitespace-nowrap text-sm font-medium text-text">
            {data.occupancy?.occupiedUnits || 0} / {data.occupancy?.totalUnits || 0} rooms ({data.occupancy?.percent || 0}%)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
