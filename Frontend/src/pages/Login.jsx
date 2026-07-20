import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Phone, KeyRound, Mail } from "lucide-react";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import GoogleIcon from "../common/GoogleIcon.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { sendOtp as sendOtpApi } from "../api/auth.api.js";
import { isValidPhone, isValidOtp } from "../utils/validators.js";

const TABS = { OTP: "otp", PASSWORD: "password" };

const RESEND_COOLDOWN_SECONDS = 30;

const Login = () => {
  const [tab, setTab] = useState(TABS.OTP);
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { loginWithOtp, loginWithPassword, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const otpForm = useForm();
  const passwordForm = useForm();

  // Ticks the resend cooldown down every second while the code screen is showing.
  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const requestOtp = async (phoneValue) => {
    const { data } = await sendOtpApi(phoneValue);
    setPhone(phoneValue);
    setOtpSent(true);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (data.data?.devOtp) toast.success(`Dev mode: your OTP is ${data.data.devOtp}`, { duration: 8000 });
    else toast.success("OTP sent to your phone");
  };

  const handleSendOtp = async ({ phone: phoneValue }) => {
    if (!isValidPhone(phoneValue)) {
      otpForm.setError("phone", { message: "Enter a valid 10-digit Indian mobile number" });
      return;
    }
    setIsSubmitting(true);
    try {
      await requestOtp(phoneValue);
    } catch (error) {
      // handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      otpForm.setValue("code", "");
      await requestOtp(phone);
    } catch (error) {
      // handled by interceptor (e.g. 429 "please wait Xs" if the clocks are out of sync)
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async ({ code, name, referralCode }) => {
    if (!isValidOtp(code)) {
      otpForm.setError("code", { message: "Enter the 6-digit OTP" });
      return;
    }
    setIsSubmitting(true);
    try {
      await loginWithOtp(phone, code, name, referralCode);
      toast.success("Welcome to StayByHour!");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome to StayByHour!");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.message || "Google sign-in failed — please try again");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordLogin = async ({ identifier, password }) => {
    setIsSubmitting(true);
    try {
      await loginWithPassword(identifier, password);
      toast.success("Logged in successfully");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // handled by interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-app flex min-h-[75vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-6 sm:p-8">
          <h1 className="text-center font-heading text-2xl font-bold text-text">Login or Sign up</h1>
          <p className="mt-1 text-center text-sm text-text-muted">Book hourly stays across India in seconds</p>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="btn-outline mt-6 w-full disabled:opacity-60"
          >
            <GoogleIcon /> {isGoogleLoading ? "Signing in…" : "Continue with Google"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="inline-flex w-full rounded-xl bg-surface-muted p-1">
            <button
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === TABS.OTP ? "bg-primary text-white" : "text-text-muted"}`}
              onClick={() => setTab(TABS.OTP)}
            >
              Phone OTP
            </button>
            <button
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === TABS.PASSWORD ? "bg-primary text-white" : "text-text-muted"}`}
              onClick={() => setTab(TABS.PASSWORD)}
            >
              Email & Password
            </button>
          </div>

          {tab === TABS.OTP && (
            <div className="mt-6">
              {!otpSent ? (
                <form onSubmit={otpForm.handleSubmit(handleSendOtp)} className="space-y-4">
                  <Input
                    label="Mobile Number"
                    placeholder="9876543210"
                    icon={Phone}
                    error={otpForm.formState.errors.phone?.message}
                    {...otpForm.register("phone", { required: "Phone number is required" })}
                  />
                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                  <p className="text-sm text-text-muted">Enter the 6-digit code sent to {phone}</p>
                  <Input
                    label="OTP"
                    placeholder="123456"
                    maxLength={6}
                    error={otpForm.formState.errors.code?.message}
                    {...otpForm.register("code", { required: "OTP is required" })}
                  />
                  <Input label="Your Name (for new accounts)" placeholder="Optional" {...otpForm.register("name")} />
                  <Input label="Referral Code (optional)" placeholder="e.g. DEMO1AB2" {...otpForm.register("referralCode")} />
                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Verify & Continue
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      className="text-text-muted hover:text-primary"
                      onClick={() => setOtpSent(false)}
                    >
                      Change phone number
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isResending}
                      className="font-medium text-primary disabled:cursor-not-allowed disabled:text-text-muted"
                    >
                      {isResending ? "Resending…" : resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {tab === TABS.PASSWORD && (
            <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="mt-6 space-y-4">
              <Input
                label="Email or Phone"
                icon={Mail}
                error={passwordForm.formState.errors.identifier?.message}
                {...passwordForm.register("identifier", { required: "Required" })}
              />
              <Input
                label="Password"
                type="password"
                icon={KeyRound}
                error={passwordForm.formState.errors.password?.message}
                {...passwordForm.register("password", { required: "Required" })}
              />
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Login
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-text-muted">
            By continuing, you agree to our <a href="/terms" className="text-primary">Terms</a> and{" "}
            <a href="/privacy" className="text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
