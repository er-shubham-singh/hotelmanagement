import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", id, icon: Icon, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />}
        <input
          id={inputId}
          ref={ref}
          className={`input ${Icon ? "pl-9" : ""} ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
