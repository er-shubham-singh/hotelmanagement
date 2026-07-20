import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock } from "lucide-react";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import { useAuth } from "../hooks/useAuth.js";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ identifier, password }) => {
    try {
      await login(identifier, password);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
            <Clock className="h-6 w-6" />
          </span>
          <h1 className="font-heading text-xl font-bold text-text">StayByHour Admin</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in with your admin or hotel-owner account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email or Phone"
            error={errors.identifier?.message}
            {...register("identifier", { required: "Required" })}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password", { required: "Required" })}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Demo credentials: admin@staybyhour.com / Admin@123
        </p>
      </div>
    </div>
  );
};

export default Login;
