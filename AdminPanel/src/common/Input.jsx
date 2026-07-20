import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`input ${error ? "border-danger" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
