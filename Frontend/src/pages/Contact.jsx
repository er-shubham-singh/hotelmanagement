import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin } from "lucide-react";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { submitContact } from "../api/user.api.js";

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      await submitContact(values);
      toast.success("Thanks for reaching out — we'll get back to you soon.");
      reset();
    } catch (error) {
      // handled by interceptor
    }
  };

  return (
    <div className="container-app py-12">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-2xl font-bold text-text sm:text-3xl">Get in Touch</h1>
        <p className="mt-2 text-text-muted">We usually respond within one business day.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <div className="card flex items-center gap-3 p-4">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-sm text-text-muted">support@staybyhour.com</span>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-sm text-text-muted">+91 1800-123-4567</span>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm text-text-muted">WeWork Galaxy, Residency Road, Bangalore</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <Input label="Your Name" error={errors.name?.message} {...register("name", { required: "Required" })} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Required" })} />
          <Input label="Subject (optional)" {...register("subject")} />
          <div>
            <label className="label">Message</label>
            <textarea className="input min-h-32" {...register("message", { required: true })} />
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
