import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import Modal from "../common/Modal.jsx";
import { getCities, createCity, updateCity, deleteCity } from "../api/hotel.api.js";

const Cities = () => {
  const queryClient = useQueryClient();
  const [editingCity, setEditingCity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-cities"],
    queryFn: async () => (await getCities()).data.data.cities,
  });

  const openCreate = () => {
    setEditingCity(null);
    reset({ name: "", state: "", heroImage: "" });
    setIsModalOpen(true);
  };

  const openEdit = (city) => {
    setEditingCity(city);
    reset({ name: city.name, state: city.state, heroImage: city.heroImage });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editingCity) {
        await updateCity(editingCity._id, values);
        toast.success("City updated");
      } else {
        await createCity(values);
        toast.success("City created");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      setIsModalOpen(false);
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this city? This cannot be undone.")) return;
    await deleteCity(id);
    toast.success("City deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
  };

  if (isLoading) return <Loader label="Loading cities…" />;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add City
        </Button>
      </div>

      {!data?.length ? (
        <EmptyState title="No cities yet" description="Add a city to start listing hotels there." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>State</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((city) => (
                <tr key={city._id}>
                  <td className="font-medium text-text">{city.name}</td>
                  <td>{city.state}</td>
                  <td>{city.isActive ? "Yes" : "No"}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(city)} className="rounded-lg p-1.5 hover:bg-surface-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(city._id)} className="rounded-lg p-1.5 text-danger hover:bg-surface-muted">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCity ? "Edit City" : "Add City"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" {...register("name", { required: true })} />
          <Input label="State" {...register("state")} />
          <Input label="Hero Image URL" {...register("heroImage")} />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Cities;
