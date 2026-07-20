import { useQuery } from "@tanstack/react-query";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { getAuditLogs } from "../api/admin.api.js";

const AuditLog = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => (await getAuditLogs({ limit: 50 })).data.data,
  });

  if (isLoading) return <Loader fullscreen label="Loading audit log…" />;
  if (!data?.logs?.length) return <EmptyState title="No audit events yet" description="Admin actions like hotel edits, refunds, and role changes will appear here." />;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {data.logs.map((log) => (
            <tr key={log._id}>
              <td className="whitespace-nowrap text-xs text-text-muted">{new Date(log.createdAt).toLocaleString("en-IN")}</td>
              <td>{log.actor?.name}<br /><span className="text-xs text-text-muted capitalize">{log.actor?.role}</span></td>
              <td className="font-mono text-xs text-text">{log.action}</td>
              <td className="text-xs text-text-muted">{log.targetType}{log.targetId ? ` (${String(log.targetId).slice(-6)})` : ""}</td>
              <td className="max-w-xs truncate text-xs text-text-muted" title={JSON.stringify(log.meta)}>
                {JSON.stringify(log.meta)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLog;
