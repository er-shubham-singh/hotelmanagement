import { AMENITY_LABELS, HOTEL_TAG_LABELS } from "../utils/constants.js";

const FilterSidebar = ({ filters, onChange, areas = [] }) => {
  const toggleTag = (tag) => {
    const next = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  };

  return (
    <aside className="w-full space-y-6 lg:w-64 lg:flex-shrink-0">
      {areas.length > 0 && (
        <div className="card p-4">
          <h4 className="mb-3 text-sm font-semibold text-text">Area</h4>
          <select
            className="input"
            value={filters.area}
            onChange={(e) => onChange({ ...filters, area: e.target.value })}
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="card p-4">
        <h4 className="mb-3 text-sm font-semibold text-text">Price Range (per slot)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="input"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
          />
          <span className="text-text-muted">–</span>
          <input
            type="number"
            placeholder="Max"
            className="input"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>

      <div className="card p-4">
        <h4 className="mb-3 text-sm font-semibold text-text">Popular Tags</h4>
        <div className="space-y-2">
          {Object.entries(HOTEL_TAG_LABELS).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-primary"
                checked={filters.tags.includes(value)}
                onChange={() => toggleTag(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h4 className="mb-3 text-sm font-semibold text-text">Amenities</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
          {Object.values(AMENITY_LABELS).map((label) => (
            <span key={label} className="rounded-lg bg-surface-muted px-2 py-1 text-center">
              {label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
