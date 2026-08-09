import { useState } from "react";
import { ChevronLeft, ChevronRight, Film } from "lucide-react";

const ImageCarousel = ({ images = [], video = null, alt = "", aspect = "aspect-[4/3]" }) => {
  const [index, setIndex] = useState(0);

  const imageItems = images.length ? images.map((src) => ({ type: "image", src })) : [{ type: "image", src: "https://picsum.photos/seed/placeholder/800/600" }];
  const list = video ? [...imageItems, { type: "video", src: video }] : imageItems;
  const current = list[index] || list[0];

  const go = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + dir + list.length) % list.length);
  };

  return (
    <div className={`group relative w-full overflow-hidden rounded-xl bg-surface-muted ${aspect}`}>
      {current.type === "video" ? (
        <video src={current.src} controls className="h-full w-full object-cover" />
      ) : (
        <img
          src={current.src}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      )}
      {list.length > 1 && (
        <>
          <button
            onClick={(e) => go(e, -1)}
            aria-label="Previous item"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => go(e, 1)}
            aria-label="Next item"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {list.map((item, i) =>
              item.type === "video" ? (
                <Film key={i} className={`h-3 w-3 ${i === index ? "text-white" : "text-white/50"}`} />
              ) : (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
