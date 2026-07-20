import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Gift, Copy } from "lucide-react";
import Input from "../../common/Input.jsx";
import Button from "../../common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { updateProfile } from "../../api/user.api.js";

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: user?.name, email: user?.email },
  });

  const onSubmit = async (values) => {
    try {
      await updateProfile(values);
      await refreshProfile();
      toast.success("Profile updated");
    } catch (error) {
      // handled by interceptor
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied");
  };

  return (
    <div className="space-y-6">
      <div className="card max-w-lg p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text">My Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
          <Input label="Email" type="email" {...register("email")} />
          <Input label="Phone Number" value={user?.phone} disabled />
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </form>
      </div>

      {user?.referralCode && (
        <div className="card max-w-lg p-6">
          <h2 className="mb-2 flex items-center gap-2 font-heading text-lg font-semibold text-text">
            <Gift className="h-5 w-5 text-primary" /> Refer & Earn
          </h2>
          <p className="text-sm text-text-muted">
            Share your code — you and your friend each get ₹150 wallet credit after their first completed stay.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface-muted px-4 py-3">
            <span className="flex-1 font-mono text-lg font-semibold tracking-wide text-text">{user.referralCode}</span>
            <button onClick={copyReferralCode} aria-label="Copy referral code" className="rounded-lg p-2 hover:bg-surface">
              <Copy className="h-4 w-4 text-text-muted" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
