import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

const BuyNow = ({ product }) => {
  const [selectedConfig, setSelectedConfig] = useState(0);
  const buyData = product.buyNowSection;

  return (
    <section className="relative px-6 py-32 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 items-start lg:grid-cols-2">
          
          {/* Left Side: Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <h2 className="mb-4 text-6xl font-bold md:text-8xl">{product.name}</h2>
            <p className="mb-12 text-2xl text-secondary">{product.subName}</p>
            
            <div className="mb-12 space-y-8">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl glass" style={{ color: product.themeColor }}>
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-bold">Personality Training</h4>
                  <div className="flex flex-wrap gap-2">
                    {buyData.processingParams.map((param, i) => (
                      <span key={i} className="px-3 py-1 text-xs tracking-widest uppercase rounded-full border bg-white/5 border-white/10 text-secondary">
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl glass" style={{ color: product.themeColor }}>
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-bold">Voice Cloning</h4>
                  <p className="max-w-sm text-sm text-secondary">{buyData.deliveryPromise}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl glass" style={{ color: product.themeColor }}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-bold">Shareable Link</h4>
                  <p className="max-w-sm text-sm text-secondary">{buyData.returnPolicy}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Pricing & CTA */}
          <motion.div
            className="glass rounded-[40px] p-10 md:p-16 relative overflow-hidden"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Background Glow */}
            <div 
              className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 rounded-full"
              style={{ background: product.themeColor }}
            />

            <div className="relative z-10">
              <div className="mb-10">
                <div className="flex gap-2 items-baseline mb-2">
                  <span className="text-6xl font-bold">{buyData.price}</span>
                  <span className="text-sm tracking-widest uppercase text-secondary">USD</span>
                </div>
                <p className="text-secondary">{buyData.unit}</p>
              </div>

              <div className="mb-12 space-y-6">
                <p className="text-sm font-bold tracking-widest uppercase text-white/40">Choose Configuration</p>
                <div className="grid grid-cols-2 gap-4">
                  {['Guided Setup', 'Self Serve'].map((config, i) => (
                    <button
                      key={config}
                      onClick={() => setSelectedConfig(i)}
                      className={`py-4 rounded-2xl border transition-all duration-300 ${
                        selectedConfig === i 
                          ? 'bg-white text-black border-white' 
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {config}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                to="/auth"
                className="w-full py-6 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  backgroundColor: product.themeColor,
                  color: '#000',
                  boxShadow: `0 20px 40px ${product.themeColor}33`
                }}
              >
                <Sparkles className="w-6 h-6" />
                Start Your Clone
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <p className="mt-6 text-xs tracking-widest text-center uppercase text-white/20">
                No credit card required for the free clone
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default BuyNow;
