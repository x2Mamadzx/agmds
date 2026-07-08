import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import logoUrl from '@assets/IMG_8165_1783477667692.jpg';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    // Délai pour laisser le menu se fermer avant de scroller
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const navLinks = [
    { name: 'Services', id: 'services' },
    { name: 'Approche', id: 'approach' },
    { name: 'Résultats', id: 'results' },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-background/90 backdrop-blur-xl border-b border-black/5 py-4' : 'bg-transparent py-6'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src={logoUrl}
            alt="MDS Marketing Logo"
            className="h-10 w-auto rounded object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="relative text-sm font-medium text-black/60 hover:text-black transition-colors uppercase tracking-wider group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[#C8922A] to-[#F5C842] group-hover:w-full transition-all duration-300" />
            </button>
          ))}
          <Button
            onClick={() => scrollTo('contact')}
            variant="default"
            className="uppercase tracking-widest text-xs relative overflow-hidden group"
          >
            <span className="relative z-10">Démarrer</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#F5C842] to-[#C8922A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <motion.button
          className="md:hidden text-black p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Menu size={28} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-[#f2f2f2] border-b border-black/10 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-8 space-y-2">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  onClick={() => scrollTo(link.id)}
                  className="text-left text-2xl font-black text-black/80 hover:text-primary transition-colors py-3 border-b border-black/5 uppercase tracking-wider"
                >
                  {link.name}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="pt-4"
              >
                <Button
                  onClick={() => scrollTo('contact')}
                  variant="default"
                  className="w-full text-base uppercase tracking-widest py-6"
                >
                  Démarrer un projet →
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
