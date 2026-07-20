import { forwardRef } from "react";

const Select = forwardRef(({ label, error, className = "", id, children, ...props }, ref) => {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}
      <select id={selectId} ref={ref} className={`input ${error ? "border-danger" : ""} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
