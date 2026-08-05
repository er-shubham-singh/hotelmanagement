import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AMENITY_LABELS, HOTEL_TAG_LABELS } from "../utils/constants.js";

const FilterFields = ({ filters, onChange, areas }) => {
  const toggleTag = (tag) => {
    const next = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
};

export const activeFilterCount = (filters) =>
  (filters.area ? 1 : 0) + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) + filters.tags.length;

// The mobile bottom-sheet's open state is controlled by the parent (so the
// trigger button can live in the same row as the sort <Select> instead of
// being rendered here) — `mobileOpen`/`onMobileOpenChange` from SearchResults.
const FilterSidebar = ({ filters, onChange, areas = [], mobileOpen = false, onMobileOpenChange = () => {} }) => {
  const [draft, setDraft] = useState(filters);

  // Start each sheet session from whatever's currently applied.
  useEffect(() => {
    if (mobileOpen) setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  const applyFilters = () => {
    onChange(draft);
    onMobileOpenChange(false);
  };

  const cancelFilters = () => {
    setDraft(filters);
    onMobileOpenChange(false);
  };

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => e.key === "Escape" && cancelFilters();
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop — always-visible sidebar, filters apply live (existing behavior). */}
      <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <FilterFields filters={filters} onChange={onChange} areas={areas} />
      </aside>

      {/* Mobile — bottom sheet with staged filters, opened by the parent's icon trigger.
          Portaled to <body> so it never becomes a (zero-height but gap-consuming)
          flex item inside whatever layout renders <FilterSidebar>. */}
      {createPortal(
        <div className="lg:hidden">
          <div
            className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
              mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={cancelFilters}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            aria-hidden={!mobileOpen}
            className={`fixed inset-x-0 bottom-0 z-50 flex h-[80vh] flex-col rounded-t-2xl bg-bg shadow-soft-lg transition-transform duration-300 ease-in-out ${
              mobileOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-heading text-base font-semibold text-text">Filters</h3>
              <button onClick={cancelFilters} aria-label="Close filters" className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterFields filters={draft} onChange={setDraft} areas={areas} />
            </div>

            <div className="flex flex-shrink-0 gap-3 border-t border-border p-4">
              <button type="button" onClick={cancelFilters} className="btn-outline flex-1 justify-center">
                Cancel
              </button>
              <button type="button" onClick={applyFilters} className="btn-accent flex-1 justify-center">
                Apply Filters
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FilterSidebar;
