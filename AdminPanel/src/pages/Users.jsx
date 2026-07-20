import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Select from "../common/Select.jsx";
import { getUsers, updateUserRole } from "../api/admin.api.js";

const ROLES = ["user", "hotelOwner", "admin"];

const Users = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await getUsers({ limit: 50 })).data.data.users,
  });

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, role);
    toast.success("Role updated");
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  if (isLoading) return <Loader label="Loading users…" />;
  if (!data?.length) return <EmptyState title="No users yet" />;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u) => (
            <tr key={u._id}>
              <td className="font-medium text-text">{u.name}</td>
              <td>{u.phone}</td>
              <td>{u.email || "—"}</td>
              <td>
                <Select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="w-36">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
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

export default Users;
