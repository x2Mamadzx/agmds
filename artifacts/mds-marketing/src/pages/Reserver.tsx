import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
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

/* ─── Motion variants for slide transitions ───────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }),
};

const QUESTION_LABEL_CLASS = "text-[11px] font-bold tracking-[0.25em] text-[#C8922A] uppercase mb-3 block";
const INPUT_CLASS = "w-full bg-transparent border-b-2 border-black/15 px-0 py-4 text-2xl md:text-3xl text-black placeholder:text-black/25 focus:outline-none focus:border-[#C8922A] transition-colors duration-300";

export default function Reserver() {
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>({ nom: '', entreprise: '', service: '', courriel: '', telephone: '', message: '' });
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const createLead = useCreateLead();

  const step = STEP_ORDER[stepIdx];

  useEffect(() => {
    // autofocus the active input when it becomes a text step
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [step]);

  const answerableSteps: StepId[] = ['nom', 'service', 'entreprise', 'courriel', 'telephone', 'message'];
  const answerableIdx = answerableSteps.indexOf(step);
  const progress = step === 'done' ? 100 : ((answerableIdx + 1) / answerableSteps.length) * 100;

  const goTo = (targetIdx: number, dir: number) => {
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

  const handleTextEnter = (e: React.KeyboardEvent, canAdvance: boolean, isLast: boolean) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!canAdvance) return;
      if (isLast) submit();
      else goNext();
    }
  };

  const nomValid = form.nom.trim().length > 0;
  const courrielValid = /\S+@\S+\.\S+/.test(form.courriel);
  const telephoneValid = form.telephone.trim().length >= 7;

  return (
    <div className="min-h-[100dvh] w-full bg-[#f2f2f2] relative overflow-hidden flex flex-col">
      {/* ambient glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,146,42,0.15)_0%,transparent_55%)]"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Header — logo + progress bar */}
      <div className="relative z-10 px-6 md:px-10 pt-6 md:pt-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className={
              step === 'done'
                ? 'text-sm font-black tracking-tight text-black transition-opacity'
                : 'text-sm font-black tracking-tight text-black/25 hover:text-black/60 transition-opacity'
            }
          >
            MDS <span className={step === 'done' ? 'text-gradient-gold' : ''}>MARKETING</span>
          </Link>
          {step !== 'done' && (
            <button onClick={goBack} disabled={stepIdx === 0} className="flex items-center gap-1.5 text-xs text-black/40 hover:text-black/70 disabled:opacity-0 disabled:pointer-events-none transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
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
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-10 py-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>

            {step === 'nom' && (
              <motion.div key="nom" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                <label className={QUESTION_LABEL_CLASS}>Question 1 / 6</label>
                <h2 className="text-2xl md:text-4xl font-black text-black leading-tight mb-8">Comment vous appelez-vous ?</h2>
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  autoFocus
                  value={form.nom}
                  onChange={(e) => setForm(p => ({ ...p, nom: e.target.value }))}
                  onKeyDown={(e) => handleTextEnter(e, nomValid, false)}
                  placeholder="Jean Tremblay"
                  className={INPUT_CLASS}
                />
                <div className="mt-8 flex items-center gap-4">
                  <Button size="lg" disabled={!nomValid} onClick={goNext} className="px-8 h-14 font-bold uppercase tracking-widest text-sm">
                    Suivant <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
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
                  autoFocus
                  value={form.entreprise}
                  onChange={(e) => setForm(p => ({ ...p, entreprise: e.target.value }))}
                  onKeyDown={(e) => handleTextEnter(e, true, false)}
                  placeholder="Votre entreprise inc. (optionnel)"
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
                  autoFocus
                  type="email"
                  value={form.courriel}
                  onChange={(e) => setForm(p => ({ ...p, courriel: e.target.value }))}
                  onKeyDown={(e) => handleTextEnter(e, courrielValid, false)}
                  placeholder="jean@entreprise.ca"
                  className={INPUT_CLASS}
                />
                <div className="mt-8 flex items-center gap-4">
                  <Button size="lg" disabled={!courrielValid} onClick={goNext} className="px-8 h-14 font-bold uppercase tracking-widest text-sm">
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
                  autoFocus
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm(p => ({ ...p, telephone: e.target.value }))}
                  onKeyDown={(e) => handleTextEnter(e, telephoneValid, false)}
                  placeholder="418-000-0000"
                  className={INPUT_CLASS}
                />
                <div className="mt-8 flex items-center gap-4">
                  <Button size="lg" disabled={!telephoneValid} onClick={goNext} className="px-8 h-14 font-bold uppercase tracking-widest text-sm">
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
                  autoFocus
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                  onKeyDown={(e) => handleTextEnter(e, true, true)}
                  placeholder="Vos objectifs, budget approximatif, défis actuels... (optionnel)"
                  className={INPUT_CLASS + ' resize-none'}
                />
                <div className="mt-8 flex items-center gap-4">
                  <Button size="lg" disabled={createLead.isPending} onClick={submit} className="px-8 h-14 font-bold uppercase tracking-widest text-sm">
                    {createLead.isPending ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</span>
                    ) : (
                      <span className="flex items-center gap-2">Réserver mon appel <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </Button>
                  <span className="text-xs text-black/35">ou appuyez sur Entrée ↵</span>
                </div>
                {createLead.isError && (
                  <p className="text-sm text-red-500 mt-4">Une erreur est survenue. Veuillez réessayer.</p>
                )}
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
