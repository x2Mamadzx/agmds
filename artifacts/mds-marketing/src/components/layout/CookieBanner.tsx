import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const COOKIE_KEY = 'mds_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  const [location] = useLocation();

  useEffect(() => {
    if (location === '/reserver-appel') return;
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) setVisible(true);
  }, [location]);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem(COOKIE_KEY, 'refused');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white border border-black/10 rounded-2xl shadow-2xl shadow-black/10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5">

            {/* Icône */}
            <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-primary" />
            </div>

            {/* Texte */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm md:text-base leading-snug">
                Ce site utilise des témoins (cookies)
              </p>
              <p className="text-muted-foreground text-xs md:text-sm mt-1 leading-relaxed">
                Nous utilisons des témoins pour améliorer votre expérience de navigation et analyser le trafic.{' '}
                <Link href="/politique-de-confidentialite" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  En savoir plus
                </Link>
              </p>
            </div>

            {/* Boutons */}
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button
                onClick={accept}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
              >
                Accepter
              </button>
              <button
                onClick={refuse}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-muted-foreground text-sm font-medium hover:text-foreground hover:bg-black/5 active:scale-95 transition-all"
              >
                Refuser
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
