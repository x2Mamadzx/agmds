import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, animate } from 'framer-motion';
import { ArrowRight, BarChart3, Target, Zap, TrendingUp, Play, Camera, Users, CheckCircle2, Globe } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import heroImage from '@assets/generated_images/hero-camera.jpg';
import servicesImage from '@assets/generated_images/services-content.jpg';
import dataImage from '@assets/generated_images/studio-production-natural.jpg';
import { useVisitTracking } from '@/hooks/useVisitTracking';

/* ─── Animated Counter ─────────────────────────────────────────── */
function Counter({ to, from = 0, prefix = '', suffix = '', format }: {
  to: number; from?: number; prefix?: string; suffix?: string; format?: (v: number) => string;
}) {
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

const CLIP_UP = {
  hidden: { clipPath: 'inset(100% 0 0 0)', opacity: 0, y: 20 },
  visible: { clipPath: 'inset(0% 0 0 0)', opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};
const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const STAGGER = { visible: { transition: { staggerChildren: 0.12 } } };

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
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={className}
      style={{ transition: 'transform 0.15s ease', willChange: 'transform' }}>
      {children}
    </div>
  );
}

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
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-start justify-center pt-28 md:pt-32 pb-16 overflow-hidden">
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

            <div className="overflow-hidden mb-1">
              <motion.h1
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-7xl md:text-9xl font-black leading-[0.88] text-black"
              >DOMINEZ</motion.h1>
            </div>
            <div className="overflow-hidden mb-1">
              <motion.h1
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 1, delay: 0.08, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-7xl md:text-9xl font-black leading-[0.88] text-gradient-gold"
              >VOTRE</motion.h1>
            </div>
            <div className="overflow-hidden mb-8">
              <motion.h1
                variants={{ hidden: { y: '110%' }, visible: { y: 0, transition: { duration: 1, delay: 0.16, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-7xl md:text-9xl font-black leading-[0.88] text-gradient-gold"
              >MARCHÉ.</motion.h1>
            </div>

            <motion.p variants={FADE_UP} className="text-lg md:text-xl text-black/55 font-light max-w-2xl mb-8 leading-relaxed">
              Nous propulsons les entreprises ambitieuses. Stratégies implacables.
              Résultats mesurables. Un ROI qui fait la différence.
            </motion.p>

            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-5">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/reserver-appel" onClick={markConverted}>
                  <Button size="lg" className="group uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(200,146,42,0.3)] hover:shadow-[0_0_60px_rgba(200,146,42,0.5)] transition-shadow duration-500">
                    Obtenir un plan d'attaque
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline"
                  className="uppercase tracking-widest text-sm text-black border-black/20 backdrop-blur-sm hover:border-black/40 transition-all"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                  Nos services
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-4 right-6 md:bottom-10 md:right-10 lg:right-20 z-20 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            variants={STAGGER} className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="overflow-hidden mb-2">
                <motion.span variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
                  className="block text-xs font-bold tracking-[0.3em] text-primary uppercase mb-6">
                  Le problème
                </motion.span>
              </div>
              <motion.h2 variants={CLIP_UP} className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Le marketing générique <br /><span className="text-black/55">tue les bonnes entreprises.</span>
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-lg text-black/55 leading-relaxed mb-10">
                Vos concurrents ne dorment pas. Si vous n'êtes pas omniprésent de manière stratégique,
                vous perdez des parts de marché chaque jour. Nous ne vendons pas des "likes" ou des "vues".
                Nous construisons des machines à acquisition de clients.
              </motion.p>
              <motion.div variants={FADE_UP} className="grid grid-cols-2 gap-8 pt-8 border-t border-black/10">
                {[
                  { val: '3s', label: "Pour capter l'attention de votre cible" },
                  { val: '100x', label: "Le potentiel de ROI d'une campagne optimisée" },
                ].map((item, i) => (
                  <div key={i}>
                    <motion.h4
                      initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                      className="text-5xl font-display font-bold text-primary mb-2">
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
              <motion.img whileHover={{ scale: 1.02 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                src={dataImage} alt="Studio production"
                className="rounded-2xl border border-black/10 shadow-2xl relative z-10 w-full object-cover aspect-[4/3]"
              />
              <motion.div
                initial={{ opacity: 0, x: -40, rotate: -3 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-8 -left-8 bg-white border border-black/10 p-6 rounded-xl shadow-2xl z-20 w-64 backdrop-blur-md"
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="text-center max-w-3xl mx-auto mb-20">
            <div className="overflow-hidden mb-3">
              <motion.span variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 0.6 } } }}
                className="block text-xs font-bold tracking-[0.3em] text-primary uppercase">
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
              { icon: Camera, title: 'Création de Contenu', desc: "Direction artistique, photographie et copywriting qui élèvent la perception de votre marque." },
              { icon: Zap, title: 'Stratégie de Marque', desc: 'Positionnement pointu et identité visuelle pour vous démarquer instantanément de la compétition.' },
              { icon: Globe, title: 'Création de Site Web Sur Mesure', desc: 'Sites web performants et professionnels conçus pour convertir vos visiteurs en clients.' },
            ].map((service, index) => (
              <motion.div key={index}
                initial={{ opacity: 0, y: 50, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                <TiltCard className="h-full bg-white/40 border border-black/5 hover:border-primary/40 p-8 rounded-2xl transition-colors duration-300 group hover:bg-white/70 relative overflow-hidden cursor-default">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#C8922A] to-[#F5C842] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,146,42,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.4 }}
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3 text-black">{service.title}</h3>
                  <p className="text-black/50 leading-relaxed text-sm">{service.desc}</p>
                </TiltCard>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block relative rounded-2xl overflow-hidden">
              <img src={servicesImage} alt="Production"
                className="w-full h-full object-cover absolute inset-0 opacity-50 scale-105 hover:scale-100 transition-transform duration-700" />
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
                <motion.h2 variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
                  className="text-4xl md:text-5xl font-bold">
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
                    <motion.div className="font-display text-5xl font-black text-black/8 group-hover:text-primary/20 transition-colors duration-500 min-w-[3rem]"
                      whileHover={{ scale: 1.1 }}>
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

            <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
              <TiltCard className="bg-white border border-black/10 rounded-2xl p-10 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-[80px]" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-10 -right-10 w-40 h-40 border border-primary/10 rounded-full" />
                <BarChart3 className="w-14 h-14 text-primary mb-8" />
                <h3 className="text-3xl font-display font-bold mb-4">La Data dicte la direction.</h3>
                <p className="text-black/55 text-base mb-10 leading-relaxed">
                  Nous ne prenons pas de décisions basées sur des "feelings". Chaque dollar investi doit avoir
                  une justification mathématique et un retour traçable.
                </p>
                <div className="space-y-6">
                  {[
                    { label: "Coût d'acquisition (CPA)", to: -62, color: '#CC2222', pct: 62 },
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
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.pct}%` }}
                          viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.3 + i * 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full" style={{ background: item.color }} />
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="text-center mb-20">
            <div className="overflow-hidden">
              <motion.h2 variants={{ hidden: { y: '100%' }, visible: { y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-4xl md:text-6xl font-black">
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
              <motion.div key={i} initial={{ opacity: 0, y: 60, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                <TiltCard className="p-10 border border-black/8 bg-white/60 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors duration-500 cursor-default">
                  <motion.div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(200,146,42,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.5 }} />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="text-5xl md:text-6xl font-black text-gradient-gold mb-3 leading-none tabular-nums whitespace-nowrap">
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
        <motion.div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,146,42,0.18)_0%,transparent_60%)]"
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />

        <div className="container px-6 mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="max-w-5xl mx-auto">
            <motion.div variants={FADE_UP} className="text-center mb-10 md:mb-14">
              <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase mb-4 block">Maintenant ou jamais</span>
              <motion.h2 variants={FADE_UP} className="text-4xl md:text-7xl font-black text-black leading-[0.9] mb-4 md:mb-6">
                DEVIENS LA RÉFÉRENCE <br /><span className="text-gradient-gold">DANS TON DOMAINE.</span>
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-base md:text-lg text-black/60 max-w-xl mx-auto">
                Pendant que vous hésitez, vos concurrents avancent. Un appel suffit pour changer la trajectoire de votre entreprise.
              </motion.p>
            </motion.div>

            <motion.div variants={FADE_UP} className="max-w-2xl mx-auto mb-10 md:mb-12">
              <div className="relative rounded-2xl">
                <div className="relative p-[2px] rounded-2xl overflow-hidden">
                  <motion.div
                    className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
                    style={{ background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, #C8922A 60deg, #F5C842 120deg, #FFE066 150deg, #F5C842 180deg, #C8922A 240deg, transparent 300deg, transparent 360deg)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative rounded-[14px] overflow-hidden bg-white p-8 md:p-10 text-center">
                    <p className="text-[10px] tracking-[0.25em] text-[#C8922A] font-bold uppercase mb-2">Appel stratégique gratuit</p>
                    <h3 className="text-xl md:text-2xl font-black text-black leading-tight mb-6">
                      6 questions rapides. <span className="text-gradient-gold">On vous rappelle.</span>
                    </h3>
                    <Link href="/reserver-appel" onClick={markConverted} className="flex justify-center">
                      <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="inline-flex w-full sm:w-auto justify-center">
                        <Button size="lg" className="w-full sm:w-auto px-6 sm:px-10 h-14 text-xs sm:text-sm font-bold uppercase tracking-wide sm:tracking-widest shadow-[0_0_30px_rgba(200,146,42,0.2)] hover:shadow-[0_0_50px_rgba(200,146,42,0.4)] transition-shadow duration-500 cursor-pointer whitespace-nowrap">
                          Réserver mon appel gratuit
                          <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                        </Button>
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={FADE_UP} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 md:mb-12">
              {[
                { title: 'Diagnostic sans détour.', desc: "On analyse votre situation réelle en 15 minutes et on identifie précisément où se cachent vos opportunités de croissance." },
                { title: "Exécution immédiate.", desc: "Pas de délai, pas de bureaucratie. On démarre rapidement avec une stratégie calibrée à votre marché." },
                { title: "Résultats mesurables.", desc: "Chaque action est tracée, analysée et optimisée. Vous voyez exactement ce que vos investissements rapportent." },
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
