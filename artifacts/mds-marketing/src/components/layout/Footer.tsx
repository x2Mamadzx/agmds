import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';
import logoUrl from '@assets/IMG_8165_1783477667692.jpg';

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
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
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-white">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-white">
                <Linkedin size={20} />
              </a>
              <a href="mailto:info@agmds.com" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all text-white">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links Col */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6 uppercase tracking-wider">Expertise</h4>
            <ul className="space-y-4 text-white/60">
              {['services', 'services', 'services', 'services', 'services'].map((id, i) => (
                <li key={i}>
                  <button onClick={() => scrollTo(id)} className="hover:text-primary transition-colors text-left">
                    {['Vidéos organiques', 'Meta & Google Ads', 'Gestion de communauté', 'Création de contenu', 'Identité de marque'][i]}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4 text-white/60">
              <li>Québec, Canada</li>
              <li>
                <a href="tel:4183139250" className="hover:text-primary transition-colors">
                  418 313-9250
                </a>
              </li>
              <li>
                <a href="mailto:info@agmds.com" className="hover:text-primary transition-colors">
                  info@agmds.com
                </a>
              </li>
              <li>
                <button onClick={() => scrollTo('contact')} className="hover:text-primary transition-colors text-left">
                  Réserver un appel →
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/40">
          <p>© {new Date().getFullYear()} MDS Marketing. Tous droits réservés.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="cursor-default">Politique de confidentialité</span>
            <span className="cursor-default">Termes et conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
