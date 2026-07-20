import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageCarousel = ({ images = [], alt = "", aspect = "aspect-[4/3]" }) => {
  const [index, setIndex] = useState(0);
  const list = images.length ? images : ["https://picsum.photos/seed/placeholder/800/600"];

  const go = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + dir + list.length) % list.length);
  };

  return (
    <div className={`group relative w-full overflow-hidden rounded-xl bg-surface-muted ${aspect}`}>
      <img src={list[index]} alt={alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
      {list.length > 1 && (
        <>
          <button
            onClick={(e) => go(e, -1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => go(e, 1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {list.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
