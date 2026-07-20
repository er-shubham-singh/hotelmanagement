const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted px-6 py-16 text-center">
    {Icon && <Icon className="h-10 w-10 text-text-muted" />}
    <h3 className="text-lg font-semibold text-text">{title}</h3>
    {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
