import { useEffect, useRef, useState } from "react";

// "down" once the user has scrolled past `threshold` px since the last
// direction change, "up" otherwise — used to hide/reveal the mobile header.
export const useScrollDirection = (threshold = 8) => {
  const [direction, setDirection] = useState("up");
  const lastY = useRef(typeof window !== "undefined" ? window.scrollY : 0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 0) {
        setDirection("up");
        lastY.current = y;
        return;
      }
      if (Math.abs(y - lastY.current) < threshold) return;
      setDirection(y > lastY.current ? "down" : "up");
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
};

export default useScrollDirection;
