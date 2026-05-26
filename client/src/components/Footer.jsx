import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer
      className="bg-gray-950 pt-32 pb-12 border-t border-white/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8 }}
    >
      {/* Decorative Blur */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
        
        {/* Column 1: Brand */}
        <div>
          <div className="flex items-center gap-3 mb-8">
             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-sm" />
             </div>
             <span className="text-xl font-bold tracking-tighter text-white">ALTER AI</span>
          </div>
          <p className="text-secondary text-sm leading-relaxed mb-8 max-w-xs">
            Train an AI on your voice and knowledge. Share a link. Let your clone answer 24/7.
          </p>
          <div className="flex gap-4">
             {[Twitter, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="p-2 glass rounded-lg transition-all duration-300 hover:bg-white hover:text-black hover:-translate-y-0.5">
                   <Icon className="w-5 h-5" />
                </a>
             ))}
          </div>
        </div>

        {/* Column 2: Plans */}
        <div>
          <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Plans</h4>
          <ul className="space-y-4">
            {['Free', 'Pro', 'Creator'].map((item) => (
              <li key={item}>
                <a href="#" className="text-secondary hover:text-white transition-colors text-sm">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Support</h4>
          <ul className="space-y-4">
            {['FAQ', 'Warranty', 'Contact', 'Press Kit'].map((item) => (
              <li key={item}>
                <a href="#" className="text-secondary hover:text-white transition-colors text-sm">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Innovation Lab</h4>
          <p className="text-secondary text-sm mb-6">Product updates, launch notes, and new clone features.</p>
          <div className="relative">
            <input 
              type="email" 
              placeholder="vessel@neural.link" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-sm focus:outline-none focus:border-white/30 transition-all pr-14"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg text-black transition-transform duration-300 hover:scale-105">
               <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <p className="text-white/20 text-xs uppercase tracking-[0.2em]">
          &copy; 2026 ALTER AI
        </p>
        <p className="text-white/40 text-xs italic">
          Designed for the future.
        </p>
        <div className="flex gap-8 text-white/20 text-[10px] uppercase tracking-widest">
           <a href="#" className="hover:text-white transition-colors">Privacy</a>
           <a href="#" className="hover:text-white transition-colors">Terms</a>
           <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
