import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import Select from "../common/Select.jsx";
import Modal from "../common/Modal.jsx";
import Badge from "../common/Badge.jsx";
import { getOffers, createOffer, updateOffer, deleteOffer } from "../api/offer.api.js";

const toDateInput = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

const Offers = () => {
  const queryClient = useQueryClient();
  const [editingOffer, setEditingOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => (await getOffers()).data.data.offers,
  });

  const openCreate = () => {
    setEditingOffer(null);
    reset({
      code: "",
      title: "",
      description: "",
      type: "flat",
      value: "",
      maxDiscount: "",
      minBooking: "",
      validFrom: toDateInput(new Date()),
      validTo: toDateInput(new Date(Date.now() + 30 * 86400000)),
      usageLimit: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (offer) => {
    setEditingOffer(offer);
    reset({
      code: offer.code,
      title: offer.title,
      description: offer.description,
      type: offer.type,
      value: offer.value,
      maxDiscount: offer.maxDiscount ?? "",
      minBooking: offer.minBooking,
      validFrom: toDateInput(offer.validFrom),
      validTo: toDateInput(offer.validTo),
      usageLimit: offer.usageLimit ?? "",
      isActive: offer.isActive,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      value: Number(values.value),
      maxDiscount: values.maxDiscount === "" ? null : Number(values.maxDiscount),
      minBooking: Number(values.minBooking) || 0,
      usageLimit: values.usageLimit === "" ? null : Number(values.usageLimit),
      isActive: values.isActive === true || values.isActive === "true",
    };
    try {
      if (editingOffer) {
        await updateOffer(editingOffer._id, payload);
        toast.success("Offer updated");
      } else {
        await createOffer(payload);
        toast.success("Offer created");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      setIsModalOpen(false);
    } catch (error) {
      // handled by interceptor
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this offer?")) return;
    await deleteOffer(id);
    toast.success("Offer deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
  };

  if (isLoading) return <Loader label="Loading offers…" />;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Offer
        </Button>
      </div>

      {!data?.length ? (
        <EmptyState title="No offers yet" description="Create a coupon to start driving bookings." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Type</th>
                <th>Value</th>
                <th>Valid Till</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((offer) => (
                <tr key={offer._id}>
                  <td className="font-mono font-medium text-text">{offer.code}</td>
                  <td>{offer.title}</td>
                  <td className="capitalize">{offer.type}</td>
                  <td>{offer.type === "percent" ? `${offer.value}%` : `₹${offer.value}`}</td>
                  <td>{toDateInput(offer.validTo)}</td>
                  <td>
                    <Badge className={offer.isActive ? "text-success" : "text-danger"}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(offer)} className="rounded-lg p-1.5 hover:bg-surface-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(offer._id)} className="rounded-lg p-1.5 text-danger hover:bg-surface-muted">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOffer ? "Edit Offer" : "Add Offer"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Coupon Code" {...register("code", { required: true })} />
            <Input label="Title" {...register("title", { required: true })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-16" {...register("description")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Type" {...register("type")}>
              <option value="flat">Flat (₹)</option>
              <option value="percent">Percent (%)</option>
            </Select>
            <Input label="Value" type="number" {...register("value", { required: true })} />
            <Input label="Max Discount (₹, optional)" type="number" {...register("maxDiscount")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Min Booking (₹)" type="number" {...register("minBooking")} />
            <Input label="Valid From" type="date" {...register("validFrom", { required: true })} />
            <Input label="Valid To" type="date" {...register("validTo", { required: true })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Usage Limit (blank = unlimited)" type="number" {...register("usageLimit")} />
            <Select label="Status" {...register("isActive")}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Save Offer
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Offers;
