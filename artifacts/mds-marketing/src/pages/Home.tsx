import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, animate } from 'framer-motion';
import { ArrowRight, BarChart3, Target, Zap, TrendingUp, Play, Camera, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateLead, useCreateVisit, useUpdateVisit } from '@workspace/api-client-react';
import heroImage from '@assets/generated_images/hero-camera.jpg';
import servicesImage from '@assets/generated_images/services-content.jpg';
import dataImage from '@assets/generated_images/studio-production-natural.jpg';

/* ─── Visit Tracking ───────────────────────────────────────────── */
const VISIT_SESSION_KEY = 'mds_visit_session_id';
const VISIT_LAST_SEEN_KEY = 'mds_visit_last_seen';
const VISIT_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // start a new visit after 30min idle

function createSessionId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// Reuses the session while the tab stays active; starts a fresh session (and
// thus a new visit row) once the visitor has been idle long enough that
// returning should count as a new visit rather than inflating the old one.
function getOrCreateSessionId(): string {
  const existingId = sessionStorage.getItem(VISIT_SESSION_KEY);
  const lastSeen = Number(sessionStorage.getItem(VISIT_LAST_SEEN_KEY) ?? 0);
  const isStale = !existingId || !lastSeen || Date.now() - lastSeen > VISIT_INACTIVITY_TIMEOUT_MS;

  const id = isStale ? createSessionId() : existingId;
  sessionStorage.setItem(VISIT_SESSION_KEY, id);
  sessionStorage.setItem(VISIT_LAST_SEEN_KEY, String(Date.now()));
  return id;
}

function useVisitTracking() {
  const sessionIdRef = useRef<string | null>(null);
  const startRef = useRef<number>(Date.now());
  const createVisit = useCreateVisit();
  const updateVisit = useUpdateVisit();

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    sessionIdRef.current = sessionId;
    startRef.current = Date.now();
    createVisit.mutate({ data: { sessionId } });

    const sendHeartbeat = () => {
      const id = sessionIdRef.current;
      if (!id) return;
      sessionStorage.setItem(VISIT_LAST_SEEN_KEY, String(Date.now()));
      const durationSeconds = Math.round((Date.now() - startRef.current) / 1000);
      updateVisit.mutate({ sessionId: id, data: { durationSeconds } });
    };

    const interval = window.setInterval(sendHeartbeat, 20000);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') sendHeartbeat();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', sendHeartbeat);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', sendHeartbeat);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markConverted = () => {
    const id = sessionIdRef.current;
    if (!id) return;
    const durationSeconds = Math.round((Date.now() - startRef.current) / 1000);
    updateVisit.mutate({ sessionId: id, data: { converted: true, durationSeconds } });
  };

  return { markConverted };
}

/* ─── Animated Counter ─────────────────────────────────────────── */
function Counter({ to, from = 0, prefix = '', suffix = '', format }: { to: number; from?: number; prefix?: string; suffix?: string; format?: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(from, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (!ref.current) return;
        const display = format ? format(v) : Math.round(v).toLocaleString('fr-CA');
        ref.current.textContent = prefix + display + suffix;
      },
    });
    return controls.stop;
  }, [inView, to, from, prefix, suffix, format]);
  return <span ref={ref}>{prefix}{format ? format(from) : from}{suffix}</span>;
}

/* ─── Clip-path reveal variant ─────────────────────────────────── */
const CLIP_UP = {
  hidden: { clipPath: 'inset(100% 0 0 0)', opacity: 0, y: 20 },
  visible: {
    clipPath: 'inset(0% 0 0 0)',
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const STAGGER = { visible: { transition: { staggerChildren: 0.12 } } };

/* ─── 3D Tilt Card ─────────────────────────────────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale3d(1.02,1.02,1.02)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transition: 'transform 0.15s ease', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function Home() {
  const { markConverted } = useVisitTracking();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const smoothY = useSpring(heroY, { stiffness: 80, damping: 20 });

  return (
    <div className="w-full">
      <div className="noise-bg" />

      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-center justify-center pt-28 md:pt-32 overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y: smoothY, scale: heroScale }}>
          <img src={heroImage} alt="Boardroom" className="w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,146,42,0.12)_0%,rgba(245,245,245,0.9)_65%)]" />
        </motion.div>

        <motion.div className="container relative z-10 px-6 mx-auto" style={{ opacity: heroOpacity }}>
          <motion.div className="max-w-4xl" initial="hidden" animate="visible" variants={STAGGER}>

            <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#CC2222] animate-pulse" />
              <span className="text-sm font-semibold tracking-[0.25em] text-black/60 uppercase">L'agence de croissance #1 au Québec</span>
            </motion.div>

            <div className="overflow-hidden mb-4">
              <motion.h1
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-7xl md:text-9xl font-black leading-[0.88] text-black"
              >
                DOMINEZ
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-10">
              <motion.h1
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-7xl md:text-9xl font-black leading-[0.88] text-gradient-gold"
              >
                VOTRE MARCHÉ.
              </motion.h1>
            </div>

            <motion.p variants={FADE_UP} className="text-xl md:text-2xl text-black/55 font-light max-w-2xl mb-12 leading-relaxed">
              Nous propulsons les entreprises ambitieuses. Stratégies implacables.
              Résultats mesurables. Un ROI qui fait la différence.
            </motion.p>

            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-5">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" className="group uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(200,146,42,0.3)] hover:shadow-[0_0_60px_rgba(200,146,42,0.5)] transition-shadow duration-500"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                  Obtenir un plan d'attaque
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline" className="uppercase tracking-widest text-sm text-black border-black/20 backdrop-blur-sm hover:border-black/40 transition-all"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                  Nos services
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator — remonté et décalé à droite sur mobile pour dégager les boutons, agrandi et poussé dans l'espace vide à droite sur desktop */}
        <motion.div
          className="absolute bottom-4 right-6 md:bottom-10 md:right-10 lg:right-20 z-20 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span className="text-xs md:text-base tracking-[0.3em] text-black/70 font-semibold uppercase">Défiler</span>
          <motion.div
            className="w-px h-14 md:h-24 bg-gradient-to-b from-black/50 to-transparent"
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ── 2. HOOK ─────────────────────────────────────────────── */}
      <section className="py-36 relative border-t border-black/5 bg-[#f7f7f7] overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="container px-6 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={STAGGER}
            className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
          >
            <div>
              <div className="overflow-hidden mb-2">
                <motion.span
                  variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
                  className="block text-xs font-bold tracking-[0.3em] text-primary uppercase mb-6"
                >
                  Le problème
                </motion.span>
              </div>
              <motion.h2 variants={CLIP_UP} className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Le marketing générique <br />
                <span className="text-black/55">tue les bonnes entreprises.</span>
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-lg text-black/55 leading-relaxed mb-10">
                Vos concurrents ne dorment pas. Si vous n'êtes pas omniprésent de manière stratégique,
                vous perdez des parts de marché chaque jour. Nous ne vendons pas des "likes" ou des "vues".
                Nous construisons des machines à acquisition de clients.
              </motion.p>
              <motion.div variants={FADE_UP} className="grid grid-cols-2 gap-8 pt-8 border-t border-black/10">
                {[
                  { val: '3s', label: 'Pour capter l\'attention de votre cible' },
                  { val: '100x', label: 'Le potentiel de ROI d\'une campagne optimisée' },
                ].map((item, i) => (
                  <div key={i}>
                    <motion.h4
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                      className="text-5xl font-display font-bold text-primary mb-2"
                    >
                      {item.val}
                    </motion.h4>
                    <p className="text-sm text-black/50">{item.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div variants={FADE_UP} className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="aspect-square rounded-full bg-primary absolute inset-0 blur-[100px]"
              />
              <motion.img
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                src={dataImage}
                alt="Studio production"
                className="rounded-2xl border border-black/10 shadow-2xl relative z-10 w-full object-cover aspect-[4/3]"
              />
              <motion.div
                initial={{ opacity: 0, x: -40, rotate: -3 }}
                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-8 -left-8 bg-card border border-black/10 p-6 rounded-xl shadow-2xl z-20 w-64 backdrop-blur-md"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Croissance des revenus</div>
                    <div className="text-xs text-black/50">Moyenne clients MDS</div>
                  </div>
                </div>
                <div className="text-4xl font-display font-bold text-gradient-gold">+<Counter to={187} suffix="%" /></div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. SERVICES ─────────────────────────────────────────── */}
      <section id="services" className="py-36 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/4 rounded-full blur-[150px] pointer-events-none" />

        <div className="container px-6 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <div className="overflow-hidden mb-3">
              <motion.span
                variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 0.6 } } }}
                className="block text-xs font-bold tracking-[0.3em] text-primary uppercase"
              >
                Notre arsenal
              </motion.span>
            </div>
            <motion.h2 variants={CLIP_UP} className="text-4xl md:text-6xl font-black mb-6">
              Un arsenal complet <br /><span className="text-gradient-gold">pour la domination.</span>
            </motion.h2>
            <motion.p variants={FADE_UP} className="text-lg text-black/55">
              Chaque service est pensé avec un seul objectif : générer de la croissance concrète pour votre entreprise.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Play, title: 'Vidéos Organiques', desc: 'Contenu court-format (Reels, TikTok, Shorts) conçu pour la viralité et la conversion naturelle.' },
              { icon: Target, title: 'Campagnes Publicitaires', desc: 'Meta Ads & Google Ads gérés avec une obsession pour le retour sur investissement (ROI).' },
              { icon: Users, title: 'Gestion des Réseaux Sociaux', desc: 'Stratégie et animation complète pour transformer votre audience en communauté fidèle.' },
              { icon: Camera, title: 'Création de Contenu', desc: 'Direction artistique, photographie et copywriting qui élèvent la perception de votre marque.' },
              { icon: Zap, title: 'Stratégie de Marque', desc: 'Positionnement pointu et identité visuelle pour vous démarquer instantanément de la compétition.' },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard className="h-full bg-card/40 border border-black/5 hover:border-primary/40 p-8 rounded-2xl transition-colors duration-300 group hover:bg-card/70 relative overflow-hidden cursor-default">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#C8922A] to-[#F5C842] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,146,42,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6"
                  >
                    <service.icon className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 text-black">{service.title}</h3>
                  <p className="text-black/50 leading-relaxed text-sm">{service.desc}</p>
                </TiltCard>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block relative rounded-2xl overflow-hidden"
            >
              <img src={servicesImage} alt="Production" className="w-full h-full object-cover absolute inset-0 opacity-50 scale-105 hover:scale-100 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. PROCESS ──────────────────────────────────────────── */}
      <section id="approach" className="py-36 relative bg-[#fafafa] overflow-hidden">
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/6 rounded-full blur-[100px] pointer-events-none" />

        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}>
              <div className="overflow-hidden mb-8">
                <motion.h2
                  variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
                  className="text-4xl md:text-5xl font-bold"
                >
                  Notre approche
                </motion.h2>
              </div>
              <div className="space-y-10">
                {[
                  { num: '01', title: 'Audit & Stratégie', desc: 'Nous analysons votre marché, vos compétiteurs et vos données actuelles. Nous trouvons les failles à exploiter.' },
                  { num: '02', title: 'Production Créative', desc: "Notre équipe tourne, monte et rédige un contenu de calibre supérieur qui force l'attention." },
                  { num: '03', title: 'Distribution & Scaling', desc: 'Nous lançons les campagnes. Nous analysons la data en temps réel. Nous injectons du budget là où le ROI explose.' },
                ].map((step, i) => (
                  <motion.div key={i} variants={FADE_UP} className="flex gap-6 group">
                    <motion.div
                      className="font-display text-5xl font-black text-black/8 group-hover:text-primary/20 transition-colors duration-500 min-w-[3rem]"
                      whileHover={{ scale: 1.1 }}
                    >
                      {step.num}
                    </motion.div>
                    <div className="pt-2">
                      <h4 className="text-xl font-bold mb-2 text-black group-hover:text-primary transition-colors duration-300">{step.title}</h4>
                      <p className="text-black/55 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard className="bg-card border border-black/10 rounded-2xl p-10 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-[80px]" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-10 -right-10 w-40 h-40 border border-primary/10 rounded-full"
                />
                <BarChart3 className="w-14 h-14 text-primary mb-8" />
                <h3 className="text-3xl font-display font-bold mb-4">La Data dicte la direction.</h3>
                <p className="text-black/55 text-base mb-10 leading-relaxed">
                  Nous ne prenons pas de décisions basées sur des "feelings". Chaque dollar investi doit avoir
                  une justification mathématique et un retour traçable.
                </p>
                <div className="space-y-6">
                  {[
                    { label: 'Coût d\'acquisition (CPA)', to: -62, color: '#CC2222', pct: 62 },
                    { label: 'Taux de conversion', to: 185, color: '#22c55e', pct: 85 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-black/65">{item.label}</span>
                        <span className="font-bold" style={{ color: item.color }}>
                          <Counter to={item.to} prefix={item.to > 0 ? '+' : ''} suffix="%" />
                        </span>
                      </div>
                      <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.4, delay: 0.3 + i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. RÉSULTATS ────────────────────────────────────────── */}
      <section id="results" className="py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,146,42,0.05)_0%,transparent_65%)] pointer-events-none" />

        <div className="container px-6 mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center mb-20"
          >
            <div className="overflow-hidden">
              <motion.h2
                variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-4xl md:text-6xl font-black"
              >
                Des résultats qui <span className="text-gradient-gold">parlent.</span>
              </motion.h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { prefix: '+', to: 3000000, from: 0, suffix: '', label: 'de vues', sub: 'générées en 2026', format: (v: number) => (v / 1000000).toFixed(v >= 2999999 ? 0 : 1) + 'M' },
              { prefix: '+', to: 1200, from: 0, suffix: '', label: 'prospects', sub: 'ultra qualifiés générés' },
              { prefix: '', to: 14, from: 150, suffix: '$', label: 'coût / prospect', sub: 'coût moyen par prospect' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard className="p-10 border border-black/8 bg-card/60 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors duration-500 cursor-default">
                  <motion.div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,146,42,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="text-6xl md:text-7xl font-black text-gradient-gold mb-3 leading-none tabular-nums">
                      <Counter to={item.to} from={item.from} prefix={item.prefix} suffix={item.suffix} format={item.format} />
                    </div>
                    <div className="text-xl font-bold text-black mb-1">{item.label}</div>
                    <div className="text-sm text-black/60">{item.sub}</div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="py-16 md:py-36 relative overflow-hidden bg-[#f2f2f2]">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,146,42,0.18)_0%,transparent_60%)]"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container px-6 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="max-w-5xl mx-auto"
          >
            {/* ── Titre ── */}
            <motion.div variants={FADE_UP} className="text-center mb-10 md:mb-14">
              <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase mb-4 block">Maintenant ou jamais</span>
              <motion.h2
                variants={FADE_UP}
                className="text-4xl md:text-7xl font-black text-black leading-[0.9] mb-4 md:mb-6"
              >
                DEVIENS LA RÉFÉRENCE <br />
                <span className="text-gradient-gold">DANS TON DOMAINE.</span>
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-base md:text-lg text-black/60 max-w-xl mx-auto">
                Pendant que vous hésitez, vos concurrents avancent. Un appel suffit pour changer la trajectoire de votre entreprise.
              </motion.p>
            </motion.div>

            {/* ── Form (large, centré) ── */}
            <motion.div variants={FADE_UP} className="max-w-4xl mx-auto mb-10 md:mb-12">
              <ContactForm onConverted={markConverted} />
            </motion.div>

            {/* ── Bullets row ── */}
            <motion.div variants={FADE_UP} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 md:mb-12">
              {[
                { title: 'Diagnostic sans détour.', desc: "On analyse votre situation réelle en 15 minutes et on identifie précisément où se cachent vos opportunités de croissance." },
                { title: "Un plan d'action, pas un PowerPoint.", desc: "Vous repartez avec des actions concrètes à exécuter dès le lendemain — pas des recommandations vagues." },
                { title: "L'honnêteté avant tout.", desc: "Si votre entreprise n'est pas le bon profil pour nos services, on vous le dit clairement. Pas de vente à tout prix." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="text-primary w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-black text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-black/55 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>


          </motion.div>
        </div>
      </section>
    </div>
  );
}

const ENTREPRISES_STORAGE_KEY = 'mds_recent_entreprises';

function ContactForm({ onConverted }: { onConverted: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nom: '', entreprise: '', courriel: '', telephone: '', service: '', message: '' });
  const [recentEntreprises, setRecentEntreprises] = useState<string[]>([]);
  const createLead = useCreateLead();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(ENTREPRISES_STORAGE_KEY) ?? '[]');
      if (Array.isArray(stored)) setRecentEntreprises(stored);
    } catch {
      // ignore malformed storage
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      {
        onSuccess: () => {
          setSubmitted(true);
          onConverted();
          if (form.entreprise.trim()) {
            const updated = [form.entreprise.trim(), ...recentEntreprises.filter(e => e !== form.entreprise.trim())].slice(0, 10);
            localStorage.setItem(ENTREPRISES_STORAGE_KEY, JSON.stringify(updated));
          }
        },
      },
    );
  };

  const loading = createLead.isPending;

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-card border border-black/10 rounded-2xl p-10 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <CheckCircle2 className="text-primary w-16 h-16 mx-auto mb-6" />
        </motion.div>
        <h3 className="text-2xl font-black text-black mb-3">Message envoyé !</h3>
        <p className="text-black/55">Notre équipe vous contactera dans les prochaines 24 heures pour confirmer votre appel stratégique.</p>
      </motion.div>
    );
  }

  const inputClass = [
    "w-full bg-transparent border-b border-black/15 px-0 py-3",
    "text-black placeholder:text-black/30 text-sm",
    "focus:outline-none focus:border-[#C8922A] transition-colors duration-300",
    "appearance-none",
  ].join(' ');

  const labelClass = "block text-[10px] font-bold tracking-[0.22em] text-[#C8922A] uppercase mb-1";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.10)] overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Gold accent bar top */}
      <div className="h-1 w-full bg-gradient-to-r from-[#C8922A] via-[#F5C842] to-[#C8922A]" />

      <div className="p-6 md:p-8">
        {/* Form header */}
        <div className="mb-5 pb-5 border-b border-black/6">
          <h3 className="text-lg font-black text-black leading-tight">
            Remplissez. On vous rappelle. <span className="text-gradient-gold">Simple.</span>
          </h3>
        </div>

        <div className="space-y-5">
          {/* Row 1 — 4 cols on lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            <div>
              <label className={labelClass}>Votre nom *</label>
              <input name="nom" required value={form.nom} onChange={handleChange} placeholder="Jean Tremblay" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Entreprise</label>
              <input name="entreprise" autoComplete="organization" list="entreprises-suggestions" value={form.entreprise} onChange={handleChange} placeholder="Votre entreprise inc." className={inputClass} />
              <datalist id="entreprises-suggestions">
                {recentEntreprises.map(e => <option key={e} value={e} />)}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Courriel *</label>
              <input name="courriel" type="email" required value={form.courriel} onChange={handleChange} placeholder="jean@entreprise.ca" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Téléphone *</label>
              <input name="telephone" type="tel" required value={form.telephone} onChange={handleChange} placeholder="418-000-0000" className={inputClass} />
            </div>
          </div>

          {/* Row 2 — service + message côte à côte sur md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className={labelClass}>Service qui vous intéresse *</label>
              <select name="service" required value={form.service} onChange={handleChange}
                className={inputClass + ' cursor-pointer bg-white'}
              >
                <option value="" disabled>Choisissez un service</option>
                <option value="videos">Vidéos organiques</option>
                <option value="pub">Campagnes pub (Meta / Google / TikTok)</option>
                <option value="reseaux">Gestion des réseaux sociaux</option>
                <option value="contenu">Création de contenu</option>
                <option value="strategie">Stratégie de marque</option>
                <option value="tout">Tout — stratégie complète</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Parlez-nous de votre projet</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={2}
                placeholder="Vos objectifs, budget approximatif, défis actuels..."
                className={inputClass + ' resize-none'} />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 md:h-14 text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(200,146,42,0.2)] hover:shadow-[0_0_50px_rgba(200,146,42,0.4)] transition-shadow duration-500"
                disabled={loading}
              >
                {loading ? (
                  <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    Envoi en cours...
                  </motion.span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Réserver mon appel gratuit
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Consent notice */}
            <p className="text-[11px] text-black/35 text-center leading-relaxed">
              En soumettant, vous acceptez notre{' '}
              <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer"
                className="text-black/50 underline underline-offset-2 hover:text-[#C8922A] transition-colors duration-200">
                politique de confidentialité
              </a>{' '}
              et consentez à être contacté par MDS Marketing.
            </p>

            {createLead.isError && (
              <p className="text-sm text-red-400 text-center">Une erreur est survenue. Veuillez réessayer.</p>
            )}
          </div>
        </div>
      </div>
    </motion.form>
  );
}
