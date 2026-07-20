import { Loader2 } from "lucide-react";

const Loader = ({ label = "Loading…", fullscreen = false }) => (
  <div className={`flex flex-col items-center justify-center gap-3 text-text-muted ${fullscreen ? "min-h-[60vh]" : "py-12"}`}>
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
    <span className="text-sm">{label}</span>
  </div>
);

export default Loader;
