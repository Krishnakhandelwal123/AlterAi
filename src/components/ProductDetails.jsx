import React from 'react';
import { motion } from 'framer-motion';

const ProductDetails = ({ product }) => {
  return (
    <section className="overflow-hidden relative px-6 py-32 backdrop-blur-sm md:px-12 bg-black/20">
      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[150px] opacity-10 rounded-full"
        style={{ background: product.themeColor }}
      />

      <div className="grid gap-20 items-center mx-auto max-w-7xl md:grid-cols-2">
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="flex gap-4 items-center mb-8">
            <div className="w-12 h-px bg-white/20" />
            <span className="text-sm tracking-widest uppercase text-secondary">HOW IT WORKS</span>
          </div>
          
          <h2 className="mb-10 text-5xl font-bold leading-tight md:text-7xl">
            {product.detailsSection.title}
          </h2>
          
          <p className="mb-12 text-xl leading-relaxed text-secondary">
            {product.detailsSection.description}
          </p>

          <div className="grid grid-cols-3 gap-8">
            {product.stats.map((stat, i) => (
              <div key={i}>
                <p className="mb-1 text-3xl font-bold" style={{ color: product.themeColor }}>{stat.val}</p>
                <p className="text-xs tracking-widest uppercase text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Feature Illustration/Image */}
        <motion.div
          className="overflow-hidden relative p-8 rounded-3xl aspect-square glass group"
          initial={{ opacity: 0, x: 36, scale: 0.95 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-50 from-white/5" />
          
          <div className="flex overflow-hidden relative justify-center items-center w-full h-full rounded-2xl border border-white/5">
             {/* Dynamic Circuit Background */}
             <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 400">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
                <rect width="400" height="400" fill="url(#grid)" />
                <circle cx="200" cy="200" r="100" fill="none" stroke={product.themeColor} strokeWidth="1" className="animate-pulse-soft" />
             </svg>

             {/* Placeholder for detail image - in production this would be /images/{id}/detail.webp */}
             <div className="relative z-10 text-center">
                <h3 className="mb-2 text-2xl font-bold">{product.name}</h3>
                <p className="text-sm text-secondary">Live Preview</p>
                <div className="flex gap-4 justify-center mt-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: product.themeColor }} />
                  ))}
                </div>
             </div>
          </div>

          {/* Innovation Lab Content (Sub-section) */}
          <div className="mt-12 md:hidden">
             <h4 className="mb-4 text-xl font-bold">{product.freshnessSection.title}</h4>
             <p className="text-sm leading-relaxed text-secondary">{product.freshnessSection.description}</p>
          </div>
        </motion.div>
      </div>

      {/* Full-width Freshness Section */}
      <div className="mx-auto mt-40 max-w-7xl">
        <motion.div
          className="p-12 glass rounded-[40px] flex flex-col md:flex-row gap-12 items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="md:w-1/2">
             <h3 className="mb-6 text-4xl font-bold">{product.freshnessSection.title}</h3>
             <p className="leading-relaxed text-secondary">{product.freshnessSection.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full md:w-1/2">
             {product.features.map((feature, i) => (
               <div key={i} className="p-6 rounded-2xl border transition-all duration-300 bg-white/5 border-white/5 hover:border-white/20 hover:-translate-y-1">
                 <p className="text-sm font-medium tracking-tight whitespace-nowrap">{feature}</p>
                 <div className="w-8 h-[2px] mt-4" style={{ background: product.themeColor }} />
               </div>
             ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductDetails;
