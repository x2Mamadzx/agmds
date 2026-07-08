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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Services', id: 'services' },
    { name: 'Approche', id: 'approach' },
    { name: 'Résultats', id: 'results' },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src={logoUrl} 
            alt="MDS Marketing Logo" 
            className="h-10 w-auto rounded object-cover transition-transform group-hover:scale-105" 
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wider"
            >
              {link.name}
            </button>
          ))}
          <Button onClick={() => scrollTo('contact')} variant="default" className="uppercase tracking-widest text-xs">
            Démarrer
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-left text-lg font-medium text-white/80 hover:text-primary transition-colors py-2 border-b border-white/5"
                >
                  {link.name}
                </button>
              ))}
              <Button onClick={() => scrollTo('contact')} variant="default" className="mt-4 w-full">
                Démarrer un projet
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
