import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Target, Zap, TrendingUp, Play, Camera, Users, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import heroImage from '@assets/generated_images/hero-boardroom.jpg';
import servicesImage from '@assets/generated_images/services-content.jpg';
import dataImage from '@assets/generated_images/studio-production-natural.jpg';

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const STAGGER = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  return (
    <div className="w-full">
      <div className="noise-bg" />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Boardroom" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,146,42,0.1)_0%,rgba(10,10,10,1)_70%)]" />
        </div>

        <div className="container relative z-10 px-6 mx-auto">
          <motion.div 
            className="max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={STAGGER}
          >
            <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#CC2222] animate-pulse" />
              <span className="text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">L'agence de croissance #1 au Québec</span>
            </motion.div>
            
            <motion.h1 variants={FADE_UP} className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 text-white">
              DOMINEZ <br />
              <span className="text-gradient-gold">VOTRE MARCHÉ.</span>
            </motion.h1>
            
            <motion.p variants={FADE_UP} className="text-xl md:text-2xl text-white/60 font-light max-w-2xl mb-10 leading-relaxed">
              Nous sommes l'agence qui propulse les entreprises ambitieuses. Des stratégies implacables. Des résultats mesurables. Un ROI qui fait la différence.
            </motion.p>
            
            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-5">
              <Button size="lg" className="group uppercase tracking-widest text-sm" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Obtenir un plan d'attaque
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="uppercase tracking-widest text-sm text-white border-white/20" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                Nos services
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. THE HOOK / PROBLEM */}
      <section className="py-32 relative border-t border-white/5 bg-[#080808]">
        <div className="container px-6 mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={STAGGER}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.h2 variants={FADE_UP} className="text-4xl md:text-5xl font-bold mb-6">
                Le marketing générique <br/>
                <span className="text-white/40">tue les bonnes entreprises.</span>
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-lg text-white/60 leading-relaxed mb-8">
                Vos concurrents ne dorment pas. Si vous n'êtes pas omniprésent de manière stratégique, vous perdez des parts de marché chaque jour. Nous ne vendons pas des "likes" ou des "vues". Nous construisons des machines à acquisition de clients.
              </motion.p>
              
              <motion.div variants={FADE_UP} className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                <div>
                  <h4 className="text-4xl font-display font-bold text-primary mb-2">3s</h4>
                  <p className="text-sm text-white/50">Pour capter l'attention de votre cible</p>
                </div>
                <div>
                  <h4 className="text-4xl font-display font-bold text-primary mb-2">10x</h4>
                  <p className="text-sm text-white/50">Le potentiel de ROI d'une campagne optimisée</p>
                </div>
              </motion.div>
            </div>
            
            <motion.div variants={FADE_UP} className="relative">
              <div className="aspect-square rounded-full bg-gradient-gold opacity-10 blur-[100px] absolute inset-0" />
              <img src={dataImage} alt="Data trends" className="rounded-xl border border-white/10 shadow-2xl relative z-10 w-full object-cover aspect-[4/3]" />
              
              {/* Floating card */}
              <div className="absolute -bottom-8 -left-8 bg-card border border-white/10 p-6 rounded-lg shadow-xl z-20 w-64 backdrop-blur-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Croissance des revenus</div>
                    <div className="text-xs text-white/50">Moyenne clients MDS</div>
                  </div>
                </div>
                <div className="text-3xl font-display font-bold">+247%</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. SERVICES */}
      <section id="services" className="py-32 relative">
        <div className="container px-6 mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <motion.h2 variants={FADE_UP} className="text-4xl md:text-5xl font-bold mb-6">Un arsenal complet <br/><span className="text-gradient-gold">pour la domination.</span></motion.h2>
            <motion.p variants={FADE_UP} className="text-lg text-white/60">Chaque service que nous offrons est pensé avec un seul objectif en tête : générer de la croissance concrète pour votre entreprise.</motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Play, title: 'Vidéos Organiques', desc: 'Contenu court-format (Reels, TikTok, Shorts) conçu pour la viralité et la conversion naturelle.' },
              { icon: Target, title: 'Campagnes Publicitaires', desc: 'Meta Ads & Google Ads gérés avec une obsession pour le retour sur investissement (ROI).' },
              { icon: Users, title: 'Gestion des Réseaux Sociaux', desc: 'Stratégie et animation complète pour transformer votre audience en communauté fidèle.' },
              { icon: Camera, title: 'Création de Contenu', desc: 'Direction artistique, photographie et copywriting qui élèvent la perception de votre marque.' },
              { icon: Zap, title: 'Stratégie de Marque', desc: 'Positionnement pointu et identité visuelle pour vous démarquer instantanément de la compétition.' },
            ].map((service, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-card/50 border border-white/5 hover:border-primary/50 p-8 rounded-xl transition-all duration-300 group hover:bg-card relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                <service.icon className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{service.desc}</p>
              </motion.div>
            ))}
            
            {/* Visual spacer card */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="hidden lg:block relative rounded-xl overflow-hidden"
            >
              <img src={servicesImage} alt="Production" className="w-full h-full object-cover absolute inset-0 opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. PROCESS */}
      <section id="approach" className="py-32 relative bg-[#050505]">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={STAGGER}
            >
              <motion.h2 variants={FADE_UP} className="text-4xl md:text-5xl font-bold mb-12">Notre approche <br/><span className="text-primary text-2xl font-normal tracking-widest uppercase mt-4 block">0 bullshit</span></motion.h2>
              
              <div className="space-y-12">
                {[
                  { num: '01', title: 'Audit & Stratégie', desc: 'Nous analysons votre marché, vos compétiteurs et vos données actuelles. Nous trouvons les failles à exploiter.' },
                  { num: '02', title: 'Production Créative', desc: 'Notre équipe tourne, monte et rédige un contenu de calibre supérieur qui force l\'attention.' },
                  { num: '03', title: 'Distribution & Scaling', desc: 'Nous lançons les campagnes. Nous analysons la data en temps réel. Nous injectons du budget là où le ROI explose.' }
                ].map((step, i) => (
                  <motion.div variants={FADE_UP} key={i} className="flex gap-6">
                    <div className="font-display text-4xl font-black text-white/10">{step.num}</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                      <p className="text-white/60 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-card border border-white/10 rounded-2xl p-10 flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
              <BarChart3 className="w-16 h-16 text-primary mb-8" />
              <h3 className="text-3xl font-display font-bold mb-4">La Data dicte la direction.</h3>
              <p className="text-white/60 text-lg mb-8">Nous ne prenons pas de décisions basées sur des "feelings". Chaque dollar investi doit avoir une justification mathématique et un retour traçable.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Coût d'acquisition (CPA)</span>
                  <span className="font-bold text-[#CC2222]">-42%</span>
                </div>
                <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                  <div className="bg-[#CC2222] h-full w-[42%]" />
                </div>
                
                <div className="flex justify-between items-center text-sm pt-4">
                  <span className="text-white/70">Taux de conversion</span>
                  <span className="font-bold text-primary">+185%</span>
                </div>
                <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[85%]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS / PROOF */}
      <section id="results" className="py-32 relative">
        <div className="container px-6 mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-20"
          >
            Ils ont choisi de <span className="text-gradient-gold">gagner.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { quote: "MDS a complètement transformé notre acquisition client. En 3 mois, nous avons dû engager du nouveau personnel pour gérer la demande générée par leurs campagnes.", author: "Roy Capital et Associés", role: "Firme d'investissement" },
              { quote: "Leur approche vidéo organique a fait exploser notre visibilité. Nous avons généré plus de ventes avec une seule vidéo virale qu'en 2 ans de marketing traditionnel.", author: "Samuel Auclair", role: "Entrepreneur" },
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-10 border border-white/10 bg-card rounded-2xl relative"
              >
                <div className="text-6xl text-primary/20 absolute top-6 left-6 font-serif">"</div>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 relative z-10 font-light">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-bold text-xl text-primary">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.author}</div>
                    <div className="text-sm text-white/50">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT / RESERVATION FORM */}
      <section id="contact" className="py-32 relative overflow-hidden bg-[#0d0d0d]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,146,42,0.15)_0%,transparent_60%)]" />

        <div className="container px-6 mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={STAGGER}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={FADE_UP} className="text-center mb-16">
              <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase mb-4 block">Travaillons ensemble</span>
              <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                RÉSERVEZ VOTRE <br />
                <span className="text-gradient-gold">APPEL STRATÉGIQUE</span>
              </h2>
              <p className="text-lg text-white/50 max-w-xl mx-auto">
                Places limitées. Remplissez le formulaire et nous vous contacterons dans les 24h pour fixer votre session gratuite.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
              {/* Form */}
              <motion.div variants={FADE_UP} className="lg:col-span-3">
                <ContactForm />
              </motion.div>

              {/* Side info */}
              <motion.div variants={FADE_UP} className="lg:col-span-2 space-y-6 pt-2">
                {[
                  { title: 'Appel de 30 minutes', desc: 'On analyse votre situation actuelle et on identifie les opportunités immédiates.' },
                  { title: 'Stratégie sur mesure', desc: 'Vous repartez avec un plan d\'action concret, adapté à votre marché québécois.' },
                  { title: 'Zéro engagement', desc: 'Pas de pression. Si on n\'est pas le bon fit, on vous le dira honnêtement.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <CheckCircle2 className="text-primary w-6 h-6 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-white mb-1">{item.title}</div>
                      <div className="text-sm text-white/50 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: '', entreprise: '', courriel: '', telephone: '', service: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-card border border-white/10 rounded-2xl p-10 text-center">
        <CheckCircle2 className="text-primary w-16 h-16 mx-auto mb-6" />
        <h3 className="text-2xl font-black text-white mb-3">Message envoyé !</h3>
        <p className="text-white/60">Notre équipe vous contactera dans les prochaines 24 heures pour confirmer votre appel stratégique.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#181818] border border-white/20 rounded-2xl p-8 space-y-5 shadow-[0_0_60px_rgba(200,146,42,0.08)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Votre nom *</label>
          <input
            name="nom" required value={form.nom} onChange={handleChange}
            placeholder="Jean Tremblay"
            className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Entreprise *</label>
          <input
            name="entreprise" required value={form.entreprise} onChange={handleChange}
            placeholder="Votre entreprise inc."
            className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Courriel *</label>
          <input
            name="courriel" type="email" required value={form.courriel} onChange={handleChange}
            placeholder="jean@entreprise.ca"
            className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Téléphone</label>
          <input
            name="telephone" type="tel" value={form.telephone} onChange={handleChange}
            placeholder="514-000-0000"
            className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Service qui vous intéresse *</label>
        <select
          name="service" required value={form.service} onChange={handleChange}
          className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm appearance-none"
        >
          <option value="" disabled className="text-white/30">Choisissez un service</option>
          <option value="videos">Vidéos organiques</option>
          <option value="pub">Campagnes publicitaires (Meta / Google / TikTok)</option>
          <option value="reseaux">Gestion des réseaux sociaux</option>
          <option value="contenu">Création de contenu</option>
          <option value="strategie">Stratégie de marque</option>
          <option value="tout">Tout — je veux une stratégie complète</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Parlez-nous de votre projet</label>
        <textarea
          name="message" value={form.message} onChange={handleChange} rows={4}
          placeholder="Décrivez vos objectifs, votre budget approximatif, vos défis actuels..."
          className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors text-sm resize-none"
        />
      </div>
      <Button type="submit" size="lg" className="w-full uppercase tracking-widest text-sm h-14" disabled={loading}>
        {loading ? 'Envoi en cours...' : 'Réserver mon appel gratuit →'}
      </Button>
    </form>
  );
}
