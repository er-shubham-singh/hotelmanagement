import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Building2 } from "lucide-react";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { submitPartnerLead } from "../api/user.api.js";

const Partner = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      await submitPartnerLead(values);
      toast.success("Thanks! Our partnerships team will reach out shortly.");
      reset();
    } catch (error) {
      // handled by interceptor
    }
  };

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-lg text-center">
        <Building2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-3 font-heading text-2xl font-bold text-text sm:text-3xl">List Your Hotel</h1>
        <p className="mt-2 text-text-muted">
          Partner with StayByHour and reach guests looking for flexible hourly and day-use stays.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card mx-auto mt-8 max-w-lg space-y-4 p-6">
        <Input label="Your Name" error={errors.name?.message} {...register("name", { required: "Required" })} />
        <Input label="Hotel Name" error={errors.hotelName?.message} {...register("hotelName", { required: "Required" })} />
        <Input label="City" error={errors.city?.message} {...register("city", { required: "Required" })} />
        <Input label="Phone Number" error={errors.phone?.message} {...register("phone", { required: "Required" })} />
        <Input label="Email (optional)" type="email" {...register("email")} />
        <div>
          <label className="label">Message (optional)</label>
          <textarea className="input min-h-24" {...register("message")} />
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Submit
        </Button>
      </form>
    </div>
  );
};

export default Partner;
