import React, { useEffect, useRef } from 'react';
import { products } from './data/products';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductDetails from './components/ProductDetails';
import BuyNow from './components/BuyNow';

const App = () => {
  const currentProduct = products[0];
  const scrollContainerRef = useRef(null);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    let scrollInstance;
    let mounted = true;
    const initLocomotive = async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      if (!mounted || !scrollContainerRef.current) return;
      scrollInstance = new LocomotiveScroll({
        el: scrollContainerRef.current,
        smooth: true,
        lerp: 0.08,
        multiplier: 0.85
      });
    };
    initLocomotive();
    return () => {
      mounted = false;
      if (scrollInstance) scrollInstance.destroy();
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { ...target };
    let rafId;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const tick = () => {
      dot.x += (target.x - dot.x) * 0.35;
      dot.y += (target.y - dot.y) * 0.35;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="overflow-x-hidden relative min-h-screen luxury-root">
      <div className="grain-overlay-fixed" />
      <div ref={cursorDotRef} className="luxury-cursor-dot" />

      <Navbar />

      <main ref={scrollContainerRef} data-scroll-container className="relative">
        <section data-scroll-section className="flex relative justify-center items-center px-7 min-h-screen md:px-12">
          <div className="w-full max-w-[1100px] mt-16 md:mt-20">
            <p className="luxury-label reveal-up" style={{ animationDelay: '0ms' }}>
            AI PERSONALITY PLATFORM · 2025
            </p>
            <h1 className="mt-7 luxury-headline">
              <span className="block reveal-up" style={{ animationDelay: '200ms' }}>One you.</span>
              <span className="reveal-up luxury-indent" style={{ animationDelay: '380ms' }}> Infinite reach.</span>
            </h1>
            <div className="mt-8 luxury-rule" />
            <p className="mt-8 luxury-subtext reveal-up" style={{ animationDelay: '720ms' }}>
            Clone yourself with AI. Let fans, students, and 
followers talk to you — in your voice, with your 
knowledge — 24/7, on autopilot.
            </p>
            <a href="#access" className="inline-block mt-8 luxury-cta reveal-up" style={{ animationDelay: '880ms' }}>
              Request Access →
            </a>
          </div>

          <div className="absolute left-8 bottom-9 md:left-12 luxury-bottom-left">
            <a href="#" aria-label="X">X</a>
            <span>·</span>
            <a href="#" aria-label="LinkedIn">LI</a>
          </div>

          <div className="absolute right-5 bottom-24 md:right-8 luxury-scroll-note">
            <span>SCROLL TO EXPLORE</span>
            <i />
          </div>

          <div className="absolute bottom-0 left-0 w-full h-px bg-[#00d4ff]/20" />
        </section>

        <section id="about" data-scroll-section>
          <ProductDetails product={currentProduct} />
        </section>

        <section id="access" data-scroll-section>
          <BuyNow product={currentProduct} />
        </section>

        <section data-scroll-section className="flex flex-col justify-center items-center px-6 py-32">
          <h2 className="mb-4 text-4xl font-bold">Join the Waitlist</h2>
          <p className="mb-8 max-w-md text-center text-secondary">
            Be the first to know about upcoming Alter Titan enterprise editions and experimental builds.
          </p>
          <button className="px-10 py-4 rounded-full transition-all duration-300 glass hover:bg-white hover:text-black hover:scale-105">
            Register Interest
          </button>
        </section>

        <div data-scroll-section>
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default App;
