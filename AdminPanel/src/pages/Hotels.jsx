import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, DoorOpen } from "lucide-react";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import Select from "../common/Select.jsx";
import Modal from "../common/Modal.jsx";
import Badge from "../common/Badge.jsx";
import { getCities, searchHotels, createHotel, updateHotel, deleteHotel } from "../api/hotel.api.js";
import { useAuth } from "../hooks/useAuth.js";

const TAGS = ["couple_friendly", "local_id", "business"];

const Hotels = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingHotel, setEditingHotel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data: cities } = useQuery({
    queryKey: ["admin-cities"],
    queryFn: async () => (await getCities()).data.data.cities,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-hotels"],
    queryFn: async () => (await searchHotels({ limit: 50 })).data.data.hotels,
  });

  const openCreate = () => {
    setEditingHotel(null);
    reset({ name: "", city: cities?.[0]?._id || "", area: "", address: "", description: "", starCategory: 3, tags: [] });
    setIsModalOpen(true);
  };

  const openEdit = (hotel) => {
    setEditingHotel(hotel);
    reset({
      name: hotel.name,
      city: hotel.city?._id,
      area: hotel.area,
      address: hotel.address,
      description: hotel.description,
      starCategory: hotel.starCategory,
      tags: hotel.tags || [],
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = { ...values, tags: Array.isArray(values.tags) ? values.tags : [values.tags].filter(Boolean) };
    try {
      if (editingHotel) {
        await updateHotel(editingHotel._id, payload);
        toast.success("Hotel updated");
      } else {
        await createHotel(payload);
        toast.success("Hotel created");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      setIsModalOpen(false);
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this hotel?")) return;
    await deleteHotel(id);
    toast.success("Hotel deactivated");
    queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
  };

  if (isLoading) return <Loader label="Loading hotels…" />;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Hotel
        </Button>
      </div>

      {!data?.length ? (
        <EmptyState title="No hotels yet" description="Add your first hotel to start taking bookings." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Area</th>
                <th>Tags</th>
                <th>Rating</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((hotel) => (
                <tr key={hotel._id}>
                  <td className="font-medium text-text">{hotel.name}</td>
                  <td>{hotel.city?.name}</td>
                  <td>{hotel.area}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {hotel.tags?.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td>{hotel.rating?.toFixed(1) || "—"}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link to={`/hotels/${hotel.slug}/rooms`} className="rounded-lg p-1.5 hover:bg-surface-muted" title="Manage rooms">
                        <DoorOpen className="h-4 w-4" />
                      </Link>
                      <button onClick={() => openEdit(hotel)} className="rounded-lg p-1.5 hover:bg-surface-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(hotel._id)} className="rounded-lg p-1.5 text-danger hover:bg-surface-muted">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingHotel ? "Edit Hotel" : "Add Hotel"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Hotel Name" {...register("name", { required: true })} />
            <Select label="City" {...register("city", { required: true })}>
              {cities?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Input label="Area" {...register("area", { required: true })} />
            <Input label="Star Category (1-5)" type="number" min={1} max={5} {...register("starCategory")} />
          </div>
          <Input label="Address" {...register("address", { required: true })} />
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-20" {...register("description")} />
          </div>
          <div>
            <label className="label">Tags</label>
            <div className="flex gap-4">
              {TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-2 text-sm text-text">
                  <input type="checkbox" value={tag} className="accent-primary" {...register("tags")} />
                  {tag.replace("_", " ")}
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save Hotel
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Hotels;
