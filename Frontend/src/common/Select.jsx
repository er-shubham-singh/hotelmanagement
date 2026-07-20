import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(({ label, error, className = "", id, children, ...props }, ref) => {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={`input appearance-none pr-9 ${error ? "border-danger" : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
