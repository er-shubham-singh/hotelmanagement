import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "btn-primary",
  outline: "btn-outline",
  danger: "btn-danger",
};

const Button = ({ variant = "primary", isLoading = false, className = "", children, disabled, ...props }) => (
  <button className={`${VARIANTS[variant]} ${className}`} disabled={disabled || isLoading} {...props}>
    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

export default Button;
