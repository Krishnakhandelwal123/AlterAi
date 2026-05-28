import React from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import Navbar from '../components/Navbar';
import ProductDetails from '../components/ProductDetails';
import BuyNow from '../components/BuyNow';
import Footer from '../components/Footer';

const Home = () => {
  const currentProduct = products[0];

  return (
    <div className="overflow-x-hidden relative min-h-screen luxury-root">
      <div className="grain-overlay-fixed" />
      <Navbar />
      <main className="relative">
        <section data-scroll-section className="flex relative justify-center items-center px-7 min-h-screen md:px-12">
          <div className="w-full max-w-[1100px] mt-16 md:mt-20">
            <p className="luxury-label reveal-up" style={{ animationDelay: '0ms' }}>
              AI PERSONALITY PLATFORM · 2025
            </p>
            <h1 className="mt-7 luxury-headline">
              <span className="block reveal-up" style={{ animationDelay: '200ms' }}>
                One you.
              </span>
              <span className="block reveal-up luxury-indent" style={{ animationDelay: '380ms' }}>
                Infinite reach.
              </span>
            </h1>
            <div className="mt-8 luxury-rule" />
            <p className="mt-8 luxury-subtext reveal-up" style={{ animationDelay: '720ms' }}>
              Clone yourself with AI. Let fans, students, and followers talk to you - in your voice, with your
              knowledge - 24/7, on autopilot.
            </p>
            <Link to="/auth" className="inline-block mt-8 luxury-cta reveal-up" style={{ animationDelay: '880ms' }}>
              Create Free Clone →
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-[#7C3AED]/20" />
        </section>

        <section id="about" data-scroll-section>
          <ProductDetails product={currentProduct} />
        </section>
        <section id="pricing" data-scroll-section>
          <BuyNow product={currentProduct} />
        </section>
        <section data-scroll-section className="relative flex flex-col justify-center items-center px-6 py-32 overflow-hidden">
          <div className="absolute inset-x-0 top-1/2 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
          <p className="luxury-label mb-5">PUBLIC BETA IS OPEN</p>
          <h2 className="mb-4 text-4xl font-bold text-center md:text-6xl">Launch your AI presence</h2>
          <p className="mb-8 max-w-xl text-center text-secondary">
            Create one trained clone, publish a shareable chat link, and let visitors ask questions while you keep building.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/auth" className="px-10 py-4 rounded-full transition-all duration-300 bg-white text-black hover:scale-105 hover:bg-cyan-200">
              Create Free Clone
            </Link>
            <Link to="/chat/demo" className="px-10 py-4 rounded-full transition-all duration-300 glass hover:bg-white/10 hover:scale-105">
              View Demo Chat
            </Link>
          </div>
        </section>
        <div data-scroll-section>
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Home;
