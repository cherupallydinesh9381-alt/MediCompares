import React, { useEffect, useRef, useState } from "react";

export const LazySectionMount = ({
  children,
  enabled,
  minHeight = 260,
  rootMargin = "350px 0px",
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return undefined;
    }

    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return (
    <div
      ref={ref}
      className="home-dynamic-lazy-slot"
      style={!visible ? { minHeight: `${minHeight}px` } : undefined}
    >
      {visible ? children : null}
    </div>
  );
};
