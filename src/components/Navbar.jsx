import React, { useEffect, useState } from 'react';

const Navbar = () => {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const updateState = () => {
      const classScrolling =
        html.classList.contains('has-scroll-scrolling') || body.classList.contains('has-scroll-scrolling');
      const nativeScrolling = window.scrollY > 4;
      setIsScrolling(classScrolling || nativeScrolling);
    };

    const htmlObserver = new MutationObserver(updateState);
    const bodyObserver = new MutationObserver(updateState);
    htmlObserver.observe(html, { attributes: true, attributeFilter: ['class'] });
    bodyObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('scroll', updateState, { passive: true });
    updateState();

    return () => {
      htmlObserver.disconnect();
      bodyObserver.disconnect();
      window.removeEventListener('scroll', updateState);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[999] py-8 px-8 md:px-14 nav-fade-in transition-colors duration-300 ${
        isScrolling
          ? 'bg-[#020814]/55 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.45)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="w-full flex items-center justify-between">
        <a href="/" className="luxury-logo">
          ALTER
        </a>

        <div className="flex items-center gap-3 md:gap-5 luxury-nav-links">
          <a href="#about">About</a>
          <span aria-hidden>·</span>
          <a href="#access">Access</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
