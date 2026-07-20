import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Select from "../common/Select.jsx";
import { listLeads, updateLeadStatus } from "../api/partner.api.js";

const STATUSES = ["new", "contacted", "converted", "rejected"];

const Leads = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => (await listLeads()).data.data.leads,
  });

  const handleStatusChange = async (id, status) => {
    await updateLeadStatus(id, status);
    toast.success("Lead status updated");
    queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
  };

  if (isLoading) return <Loader label="Loading leads…" />;
  if (!data?.length) return <EmptyState title="No partner leads yet" description="Leads from the 'List Your Hotel' form will show up here." />;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Hotel</th>
            <th>City</th>
            <th>Contact</th>
            <th>Message</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((lead) => (
            <tr key={lead._id}>
              <td className="font-medium text-text">{lead.name}</td>
              <td>{lead.hotelName}</td>
              <td>{lead.city}</td>
              <td>{lead.phone}<br /><span className="text-xs text-text-muted">{lead.email}</span></td>
              <td className="max-w-xs truncate">{lead.message}</td>
              <td>
                <Select value={lead.status} onChange={(e) => handleStatusChange(lead._id, e.target.value)} className="w-36">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leads;
