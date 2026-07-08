import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Instagram, Linkedin, Mail } from 'lucide-react';
import logoUrl from '@assets/IMG_8165_1783477667692.jpg';

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <img src={logoUrl} alt="MDS Marketing" className="h-16 mb-6 rounded" />
            <p className="text-white/60 max-w-sm mb-8 text-lg">
              L'agence des entreprises québécoises qui refusent le statu quo. Nous transformons l'attention en revenus.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-white">
                <Linkedin size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-white">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links Col */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6 uppercase tracking-wider">Expertise</h4>
            <ul className="space-y-4 text-white/60">
              <li><a href="#" className="hover:text-primary transition-colors">Vidéos organiques</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Meta & Google Ads</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Gestion de communauté</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Création de contenu</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Identité de marque</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4 text-white/60">
              <li>Montréal, Québec</li>
              <li><a href="mailto:info@mdsmarketing.ca" className="hover:text-primary transition-colors">info@mdsmarketing.ca</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/40">
          <p>© {new Date().getFullYear()} MDS Marketing. Tous droits réservés.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Termes et conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
