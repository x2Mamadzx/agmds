import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Users, ShieldCheck, Clock3, Star, Sparkles, TrendingUp, MessageCircle, Award } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCreateLead } from '@workspace/api-client-react';

/* ─── Types ────────────────────────────────────────────────────── */
type FormData = {
  nom: string;
  entreprise: string;
  service: string;
  courriel: string;
  telephone: string;
  message: string;
};

type StepId = keyof FormData | 'done';

const SERVICE_OPTIONS = [
  { value: 'videos', label: 'Vidéos organiques' },
  { value: 'pub', label: 'Campagnes pub (Meta / Google / TikTok)' },
  { value: 'reseaux', label: 'Gestion des réseaux sociaux' },
  { value: 'contenu', label: 'Création de contenu' },
  { value: 'strategie', label: 'Stratégie de marque' },
  { value: 'tout', label: 'Tout — stratégie complète' },
];

const STEP_ORDER: StepId[] = ['nom', 'service', 'entreprise', 'courriel', 'telephone', 'message', 'done'];

// Area codes actually in use in Québec (including overlay codes), so we only accept
// numbers that could plausibly be a Québec landline/mobile — digits only, dashes/spaces ignored.
const QUEBEC_AREA_CODES = ['418', '367', '438', '450', '468', '514', '579', '581', '819', '873'];

function isValidQuebecPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  const tenDigits = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (tenDigits.length !== 10) return false;
  const areaCode = tenDigits.slice(0, 3);
  const exchange = tenDigits.slice(3, 4);
  if (exchange === '0' || exchange === '1') return false; // exchange codes can't start with 0/1
  return QUEBEC_AREA_CODES.includes(areaCode);
}

/* ─── Motion variants for slide transitions ───────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }),
};

const QUESTION_LABEL_CLASS = "text-[11px] font-bold tracking-[0.25em] text-[#C8922A] uppercase mb-3 block";
const INPUT_CLASS = "w-full bg-transparent border-b-2 border-black/15 px-0 py-4 text-2xl md:text-3xl text-black placeholder:text-black/25 focus:outline-none focus:border-[#C8922A] transition-colors duration-300";

/* ─── Side bubbles: rotating reassurance messages, no fabricated stats ── */
const BUBBLE_POOL = [
  { icon: Users, text: 'Accompagnement personnalisé' },
  { icon: ShieldCheck, text: 'Sans engagement' },
  { icon: Clock3, text: 'Réponse rapide' },
  { icon: Star, text: '100 % sur mesure' },
  { icon: Sparkles, text: 'Stratégie claire, sans jargon' },
  { icon: TrendingUp, text: 'Résultats mesurables' },
  { icon: MessageCircle, text: 'Échange humain, pas un robot' },
  { icon: Award, text: 'Expertise reconnue' },
];

// One zone per slot (top/middle-ish) so bubbles can land near the middle too, while staying spread out.
// Kept below the "Places limitées" badge height so they never float above the header content.
const SLOT_ZONES: string[][] = [
  ['22%', '28%', '34%'],
  ['46%', '54%', '62%'],
  ['24%', '30%', '36%'],
  ['48%', '56%', '64%'],
];
const SLOT_SIDES: Array<'left' | 'right'> = ['left', 'left', 'right', 'right'];
const SLOT_INTERVALS = [6500, 7200, 6900, 7600];

function pickRandom<T>(arr: T[], exclude?: T): T {
  const options = exclude !== undefined ? arr.filter((v) => v !== exclude) : arr;
  return options[Math.floor(Math.random() * options.length)] ?? arr[0];
}

function useRotatingBubbles() {
  const [items, setItems] = useState(() =>
    SLOT_SIDES.map((side, i) => ({
      ...BUBBLE_POOL[i % BUBBLE_POOL.length],
      top: SLOT_ZONES[i][0],
      side,
    })),
  );
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const timers = SLOT_SIDES.map((_, slotIdx) =>
      setInterval(() => {
        setItems((prev) => {
          const others = prev.filter((_, i) => i !== slotIdx).map((b) => b.text);
          const currentText = prev[slotIdx].text;
          const candidates = BUBBLE_POOL.filter((b) => b.text !== currentText && !others.includes(b.text));
          const nextEntry = candidates.length > 0 ? pickRandom(candidates) : pickRandom(BUBBLE_POOL, BUBBLE_POOL.find((b) => b.text === currentText));
          const nextTop = pickRandom(SLOT_ZONES[slotIdx], prev[slotIdx].top);
          const next = [...prev];
          next[slotIdx] = { ...nextEntry, top: nextTop, side: SLOT_SIDES[slotIdx] };
          return next;
        });
      }, SLOT_INTERVALS[slotIdx]),
    );
    return () => timers.forEach(clearInterval);
  }, []);

  return items;
}

export default function Reserver() {
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>({ nom: '', entreprise: '', service: '', courriel: '', telephone: '', message: '' });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const createLead = useCreateLead();

  const sideBubbles = useRotatingBubbles();

  const step = STEP_ORDER[stepIdx];

  useEffect(() => {
    // Autofocus on desktop only — on mobile, opening the keyboard automatically
    // feels intrusive, so the prospect taps the field themselves when ready.
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [step]);

  const answerableSteps: StepId[] = ['nom', 'service', 'entreprise', 'courriel', 'telephone', 'message'];
  const answerableIdx = answerableSteps.indexOf(step);
  const progress = step === 'done' ? 100 : ((answerableIdx + 1) / answerableSteps.length) * 100;

  const goTo = (targetIdx: number, dir: number) => {
    setFieldError(null);
    setDirection(dir);
    setStepIdx(targetIdx);
  };

  const goNext = () => {
    if (stepIdx < STEP_ORDER.length - 1) goTo(stepIdx + 1, 1);
  };

  const goBack = () => {
    if (stepIdx > 0) goTo(stepIdx - 1, -1);
  };

  const submit = () => {
    createLead.mutate(
      {
        data: {
          nom: form.nom,
          entreprise: form.entreprise || undefined,
          courriel: form.courriel,
          telephone: form.telephone,
          service: form.service,
          message: form.message || undefined,
        },
      },
      { onSuccess: () => goNext() },
    );
  };

  const handleTextEnter = (e: React.KeyboardEvent, canAdvance: boolean, isLast: boolean, errorMessage?: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!canAdvance) {
        if (errorMessage) setFieldError(errorMessage);
        return;
      }
      setFieldError(null);
      if (isLast) submit();
      else goNext();
    }
  };

  const attemptNext = (canAdvance: boolean, errorMessage: string) => {
    if (!canAdvance) {
      setFieldError(errorMessage);
      return;
    }
    setFieldError(null);
    goNext();
  };

  const nomValid = form.nom.trim().length > 0;
  const courrielValid = /\S+@\S+\.\S+/.test(form.courriel);
  const telephoneValid = isValidQuebecPhone(form.telephone);

  return (
    <div className="h-[100dvh] w-full bg-[#f2f2f2] relative overflow-hidden flex flex-col">
      {/* ambient glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,146,42,0.15)_0%,transparent_55%)]"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Trust/info bubbles — reassurance cues on the sides, rotate position + message, no fabricated stats */}
      {step !== 'done' && (
        <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden">
          {sideBubbles.map((bubble, i) => {
            const Icon = bubble.icon;
            return (
              <div
                key={i}
                className={`absolute ${bubble.side === 'left' ? 'left-[3%]' : 'right-[3%]'}`}
                style={{ top: bubble.top, transition: 'top 1.2s ease-in-out' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={bubble.text}
                    className="flex items-center gap-2 rounded-2xl bg-white/85 backdrop-blur-sm border border-[#C8922A]/15 shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-3.5 py-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: [0, -8, 0],
                      x: bubble.side === 'left' ? [0, 5, 0] : [0, -5, 0],
                    }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5 } }}
                    transition={{
                      opacity: { duration: 0.6 },
                      scale: { duration: 0.6 },
                      y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' },
                      x: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#C8922A] shrink-0" />
                    <span className="text-xs font-semibold text-black/60 whitespace-nowrap">{bubble.text}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile: same rotating bubble, tucked into the thin strip at the bottom of the screen */}
      {step !== 'done' && (
        <div className="flex lg:hidden fixed bottom-3 left-0 right-0 justify-center pointer-events-none z-0 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={sideBubbles[0].text}
              className="flex items-center gap-1.5 rounded-2xl bg-white/85 backdrop-blur-sm border border-[#C8922A]/15 shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-3 py-1.5"
              initial={{ opacity: 0, scale: 0.9, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 6, transition: { duration: 0.4 } }}
              transition={{ duration: 0.5 }}
            >
              {(() => {
                const Icon = sideBubbles[0].icon;
                return <Icon className="w-3 h-3 text-[#C8922A] shrink-0" />;
              })()}
              <span className="text-[11px] font-semibold text-black/60 whitespace-nowrap">{sideBubbles[0].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Header — logo + progress bar */}
      <div className="relative z-10 px-6 md:px-10 pt-6 md:pt-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-sm font-black tracking-tight text-black transition-opacity">
            MDS <span className="text-gradient-gold">MARKETING</span>
          </Link>
          {step !== 'done' && (
            <div className="flex items-center gap-4">
              <button onClick={goBack} disabled={stepIdx === 0} className="flex items-center gap-1.5 text-xs text-black/40 hover:text-black/70 disabled:opacity-0 disabled:pointer-events-none transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour
              </button>
              <Link href="/" className="text-[11px] text-black/25 hover:text-black/60 transition-opacity">
                Aller au site
              </Link>
            </div>
          )}
        </div>
        <div className="h-1 w-full bg-black/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C8922A] to-[#F5C842]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Question stage */}
      <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-6 md:px-10 py-6 md:py-10 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>

            {step === 'nom' && (
              <motion.div key="nom" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-center gap-2 mb-3"
                >
                  <motion.span
                    className="w-2 h-2 rounded-full bg-[#C8922A]"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="text-[11px] font-bold tracking-[0.25em] text-[#C8922A] uppercase">
                    Places limitées cette semaine
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl md:text-5xl font-black text-black leading-[1.02] mb-2"
                >
                  Découvrez comment <span className="text-gradient-gold">dominer votre marché</span> en 2 minutes.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-sm md:text-base text-black/55 mb-8 md:mb-14"
                >
                  6 questions rapides. On analyse votre situation et on vous propose un plan concret — sans engagement.
                </motion.p>

                <label className={QUESTION_LABEL_CLASS}>Question 1 / 6</label>
                <h2 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">Comment vous appelez-vous ?</h2>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  value={form.nom}
                  onChange={(e) => setForm(p => ({ ...p, nom: e.target.value }))}
                  onKeyDown={(e) => handleTextEnter(e, nomValid, false)}
                  placeholder="Nom"
                  className={INPUT_CLASS}
                />
                <div className="mt-8 flex items-center gap-4">
                  <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex">
                    <Button size="lg" disabled={!nomValid} onClick={goNext} className="px-10 h-14 font-bold uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(200,146,42,0.25)]">
                      Suivant <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.span>
                  <span className="text-xs text-black/35">ou appuyez sur Entrée ↵</span>
                </div>
              </motion.div>
            )}

            {step === 'service' && (
              <motion.div key="service" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <label className={QUESTION_LABEL_CLASS}>Question 2 / 6</label>
                <h2 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">Quel service vous intéresse le plus, {form.nom.split(' ')[0] || ''} ?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICE_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setForm(p => ({ ...p, service: opt.value })); goNext(); }}
                      className="text-left px-5 py-4 rounded-xl border border-black/10 bg-white hover:border-[#C8922A] hover:shadow-[0_4px_20px_rgba(200,146,42,0.12)] transition-all duration-200 text-sm font-semibold text-black"
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'entreprise' && (
              <motion.div key="entreprise" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <label className={QUESTION_LABEL_CLASS}>Question 3 / 6</label>
                <h2 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">Quel est le nom de votre entreprise ?</h2>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  value={form.entreprise}
                  onChange={(e) => setForm(p => ({ ...p, entreprise: e.target.value }))}
                  onKeyDown={(e) => handleTextEnter(e, true, false)}
                  placeholder="Entreprise (optionnel)"
                  className={INPUT_CLASS}
                />
                <div className="mt-8 flex items-center gap-4">
                  <Button size="lg" onClick={goNext} className="px-8 h-14 font-bold uppercase tracking-widest text-sm">
                    Suivant <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <span className="text-xs text-black/35">ou appuyez sur Entrée ↵</span>
                </div>
              </motion.div>
            )}

            {step === 'courriel' && (
              <motion.div key="courriel" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <label className={QUESTION_LABEL_CLASS}>Question 4 / 6</label>
                <h2 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">Quel est votre courriel ?</h2>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="email"
                  value={form.courriel}
                  onChange={(e) => { setForm(p => ({ ...p, courriel: e.target.value })); if (fieldError) setFieldError(null); }}
                  onKeyDown={(e) => handleTextEnter(e, courrielValid, false, 'Ce courriel ne semble pas valide. Vérifiez-le et réessayez.')}
                  placeholder="Courriel"
                  className={INPUT_CLASS}
                />
                {fieldError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500 mt-3">
                    {fieldError}
                  </motion.p>
                )}
                <div className="mt-8 flex items-center gap-4">
                  <Button size="lg" onClick={() => attemptNext(courrielValid, 'Ce courriel ne semble pas valide. Vérifiez-le et réessayez.')} className="px-8 h-14 font-bold uppercase tracking-widest text-sm">
                    Suivant <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <span className="text-xs text-black/35">ou appuyez sur Entrée ↵</span>
                </div>
              </motion.div>
            )}

            {step === 'telephone' && (
              <motion.div key="telephone" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <label className={QUESTION_LABEL_CLASS}>Question 5 / 6</label>
                <h2 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">À quel numéro peut-on vous rappeler ?</h2>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => { setForm(p => ({ ...p, telephone: e.target.value })); if (fieldError) setFieldError(null); }}
                  onKeyDown={(e) => handleTextEnter(e, telephoneValid, false, 'Ce numéro ne semble pas être un numéro valide au Québec.')}
                  placeholder="Téléphone"
                  className={INPUT_CLASS}
                />
                {fieldError && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500 mt-3">
                    {fieldError}
                  </motion.p>
                )}
                <div className="mt-8 flex items-center gap-4">
                  <Button size="lg" onClick={() => attemptNext(telephoneValid, 'Ce numéro ne semble pas être un numéro valide au Québec.')} className="px-8 h-14 font-bold uppercase tracking-widest text-sm">
                    Suivant <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <span className="text-xs text-black/35">ou appuyez sur Entrée ↵</span>
                </div>
              </motion.div>
            )}

            {step === 'message' && (
              <motion.div key="message" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <label className={QUESTION_LABEL_CLASS}>Question 6 / 6</label>
                <h2 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">Parlez-nous de votre projet.</h2>
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                  onKeyDown={(e) => handleTextEnter(e, true, true)}
                  placeholder="Message (optionnel)"
                  className={INPUT_CLASS + ' resize-none'}
                />
                <div className="mt-8 flex items-center gap-4">
                  <Button size="lg" disabled={createLead.isPending} onClick={submit} className="px-8 h-14 font-bold uppercase tracking-widest text-sm">
                    {createLead.isPending ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</span>
                    ) : (
                      <span className="flex items-center gap-2">Continuer <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </Button>
                  <span className="text-xs text-black/35">ou appuyez sur Entrée ↵</span>
                </div>
                {createLead.isError && (
                  <p className="text-sm text-red-500 mt-4">Une erreur est survenue. Veuillez réessayer.</p>
                )}
                <p className="text-[10px] text-black/25 mt-6">
                  En cliquant sur Continuer, vous acceptez notre{' '}
                  <Link href="/politique-de-confidentialite" className="underline hover:text-black/45">
                    politique de confidentialité
                  </Link>.
                </p>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="text-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                >
                  <CheckCircle2 className="text-primary w-20 h-20 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-3xl md:text-5xl font-black text-black leading-tight mb-4">
                  Message envoyé, {form.nom.split(' ')[0] || ''} !
                </h2>
                <p className="text-base md:text-lg text-black/60 max-w-lg mx-auto mb-10">
                  Notre équipe vous contactera au <span className="font-bold text-black">{form.telephone}</span> dans les prochaines 24 heures pour confirmer votre appel stratégique.
                </p>
                <Link href="/">
                  <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex">
                    <Button size="lg" className="px-10 h-14 text-sm font-bold uppercase tracking-widest cursor-pointer">
                      Retour à l'accueil <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.span>
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
