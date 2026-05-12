import React, { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Single smooth-scroll instance for the whole app (marketing + dashboard).
 * Skipped on coarse pointers (touch) where native scroll is preferable.
 */
const LocomotiveRoot = ({ children }) => {
  const containerRef = useRef(null);
  const locoRef = useRef(null);
  const location = useLocation();

  useLayoutEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse || !containerRef.current) return undefined;

    let mounted = true;

    const run = async () => {
      const { default: LocomotiveScrollCtor } = await import('locomotive-scroll');
      if (!mounted || !containerRef.current) return;
      locoRef.current?.destroy();
      locoRef.current = new LocomotiveScrollCtor({
        el: containerRef.current,
        smooth: true,
        lerp: 0.09,
        multiplier: 0.92,
        smartphone: { smooth: false },
        tablet: { smooth: false }
      });
    };

    run();

    return () => {
      mounted = false;
      locoRef.current?.destroy();
      locoRef.current = null;
    };
  }, [location.pathname]);

  return (
    <div ref={containerRef} data-scroll-container className="luxury-scroll-root min-h-screen overflow-x-hidden">
      {children}
    </div>
  );
};

export default LocomotiveRoot;
