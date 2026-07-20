import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Upload } from "lucide-react";
import Loader from "../common/Loader.jsx";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import Modal from "../common/Modal.jsx";
import { getHotelBySlug, createRoom, updateRoom, deleteRoom, uploadHotelImages } from "../api/hotel.api.js";
import { env } from "../config/env.js";

const AMENITIES = ["wifi", "ac", "tv", "water", "parking", "breakfast", "room_service"];

const HotelRooms = () => {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-hotel", slug],
    queryFn: async () => (await getHotelBySlug(slug)).data.data,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-hotel", slug] });

  const openCreate = () => {
    setEditingRoom(null);
    reset({ type: "", adults: 2, children: 0, threeHr: "", sixHr: "", twelveHr: "", fullDay: "", amenities: [], totalUnits: 1 });
    setIsModalOpen(true);
  };

  const openEdit = (room) => {
    setEditingRoom(room);
    reset({
      type: room.type,
      adults: room.capacity?.adults,
      children: room.capacity?.children,
      threeHr: room.priceSlots?.threeHr ?? "",
      sixHr: room.priceSlots?.sixHr ?? "",
      twelveHr: room.priceSlots?.twelveHr ?? "",
      fullDay: room.priceSlots?.fullDay ?? "",
      amenities: room.amenities || [],
      totalUnits: room.totalUnits,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = {
      type: values.type,
      capacity: { adults: Number(values.adults) || 1, children: Number(values.children) || 0 },
      priceSlots: {
        threeHr: values.threeHr === "" ? null : Number(values.threeHr),
        sixHr: values.sixHr === "" ? null : Number(values.sixHr),
        twelveHr: values.twelveHr === "" ? null : Number(values.twelveHr),
        fullDay: values.fullDay === "" ? null : Number(values.fullDay),
      },
      amenities: Array.isArray(values.amenities) ? values.amenities : [values.amenities].filter(Boolean),
      totalUnits: Number(values.totalUnits) || 1,
    };

    try {
      if (editingRoom) {
        await updateRoom(editingRoom._id, payload);
        toast.success("Room updated");
      } else {
        await createRoom(data.hotel._id, payload);
        toast.success("Room created");
      }
      refresh();
      setIsModalOpen(false);
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm("Deactivate this room?")) return;
    await deleteRoom(id);
    toast.success("Room deactivated");
    refresh();
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("images", f));
    setIsUploading(true);
    try {
      await uploadHotelImages(data.hotel._id, formData);
      toast.success("Images uploaded");
      refresh();
    } catch (error) {
      // handled by interceptor
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) return <Loader fullscreen label="Loading hotel…" />;
  if (!data?.hotel) return <p className="text-text-muted">Hotel not found.</p>;

  return (
    <div>
      <Link to="/hotels" className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Hotels
      </Link>

      <div className="mb-6 card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-text">{data.hotel.name}</h2>
            <p className="text-sm text-text-muted">{data.hotel.area}, {data.hotel.city?.name}</p>
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
            <Button variant="outline" isLoading={isUploading} onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Images
            </Button>
          </div>
        </div>
        {data.hotel.images?.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {data.hotel.images.map((img) => (
              <img
                key={img}
                src={img.startsWith("http") ? img : `${env.apiBaseUrl.replace("/api/v1", "")}${img}`}
                alt=""
                className="h-20 w-28 flex-shrink-0 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-text">Room Types & Pricing</h3>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Capacity</th>
              <th>3 Hrs</th>
              <th>6 Hrs</th>
              <th>12 Hrs</th>
              <th>Full Day</th>
              <th>Units</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.rooms.map((room) => (
              <tr key={room._id}>
                <td className="font-medium text-text">{room.type}</td>
                <td>{room.capacity?.adults}A / {room.capacity?.children}C</td>
                <td>{room.priceSlots?.threeHr ? `₹${room.priceSlots.threeHr}` : "—"}</td>
                <td>{room.priceSlots?.sixHr ? `₹${room.priceSlots.sixHr}` : "—"}</td>
                <td>{room.priceSlots?.twelveHr ? `₹${room.priceSlots.twelveHr}` : "—"}</td>
                <td>{room.priceSlots?.fullDay ? `₹${room.priceSlots.fullDay}` : "—"}</td>
                <td>{room.totalUnits}</td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(room)} className="rounded-lg p-1.5 hover:bg-surface-muted">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteRoom(room._id)} className="rounded-lg p-1.5 text-danger hover:bg-surface-muted">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? "Edit Room" : "Add Room"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Room Type" {...register("type", { required: true })} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Adults" type="number" min={1} {...register("adults")} />
            <Input label="Children" type="number" min={0} {...register("children")} />
            <Input label="Total Units" type="number" min={0} {...register("totalUnits")} />
          </div>
          <div>
            <label className="label">Price Slots (₹) — leave blank for unavailable</label>
            <div className="grid grid-cols-4 gap-3">
              <Input placeholder="3 Hrs" type="number" {...register("threeHr")} />
              <Input placeholder="6 Hrs" type="number" {...register("sixHr")} />
              <Input placeholder="12 Hrs" type="number" {...register("twelveHr")} />
              <Input placeholder="Full Day" type="number" {...register("fullDay")} />
            </div>
          </div>
          <div>
            <label className="label">Amenities</label>
            <div className="grid grid-cols-4 gap-2">
              {AMENITIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm text-text">
                  <input type="checkbox" value={a} className="accent-primary" {...register("amenities")} />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save Room
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default HotelRooms;
