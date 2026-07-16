import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const STAGGER = { visible: { transition: { staggerChildren: 0.08 } } };

export default function PrivacyPolicy() {
  const updated = '8 juillet 2025';
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Content — pt-28 pour dégager la Navbar fixe */}
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-3xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER}
        >
          <motion.div variants={FADE_UP} className="mb-10">
            <span className="text-xs font-bold tracking-[0.25em] text-primary uppercase">Politique de confidentialité</span>
            <h1 className="text-4xl font-black mt-3 mb-2">Vos informations, protégées.</h1>
            <p className="text-black/50 text-sm">Dernière mise à jour : {updated}</p>
          </motion.div>

          <motion.div variants={FADE_UP} className="bg-white rounded-2xl border border-black/8 p-8 md:p-12 space-y-10 shadow-sm">

            <Section title="1. Qui sommes-nous ?">
              <p>
                MDS Marketing (ci-après « nous », « notre » ou « MDS ») est une agence de marketing numérique dont le
                siège social est situé à Québec, Canada. Nous offrons des services de publicité, de création de contenu
                et de stratégie de croissance aux entreprises québécoises.
              </p>
              <p className="mt-3">
                Pour toute question relative à la présente politique, vous pouvez nous joindre à :{' '}
                <a href="mailto:info@agmds.com" className="text-primary font-medium hover:underline">info@agmds.com</a>
                {' '}ou au{' '}
                <a href="tel:4183139250" className="text-primary font-medium hover:underline">418 313-9250</a>.
              </p>
            </Section>

            <Section title="2. Informations que nous collectons">
              <p>Lorsque vous remplissez notre formulaire de contact ou interagissez avec nos services, nous pouvons collecter :</p>
              <ul className="mt-3 space-y-2 pl-4">
                <Li>Votre nom et prénom</Li>
                <Li>Votre adresse courriel</Li>
                <Li>Votre numéro de téléphone</Li>
                <Li>Le nom et le secteur d'activité de votre entreprise</Li>
                <Li>Des informations générales sur vos besoins en marketing</Li>
                <Li>Des données de navigation anonymes (durée de la visite, soumission du formulaire de contact) à des fins statistiques internes</Li>
              </ul>
            </Section>

            <Section title="3. Finalités de la collecte">
              <p>Vos informations sont utilisées exclusivement pour :</p>
              <ul className="mt-3 space-y-2 pl-4">
                <Li>Vous contacter par téléphone, courriel ou autre moyen afin de discuter de vos besoins et vous présenter nos services</Li>
                <Li>Préparer et vous transmettre des propositions commerciales personnalisées</Li>
                <Li>Assurer le suivi de nos échanges et la relation client</Li>
                <Li>Améliorer nos services et l'expérience de notre site Web</Li>
              </ul>
              <p className="mt-4 text-black/60 text-sm">
                Nous ne vendons, ne louons et ne partageons jamais vos informations personnelles à des tiers à des fins
                commerciales ou publicitaires.
              </p>
            </Section>

            <Section title="4. Appels téléphoniques et communications commerciales">
              <p>
                En nous transmettant votre numéro de téléphone via notre formulaire de contact, vous consentez
                expressément à ce que MDS Marketing vous contacte par téléphone dans le but de discuter de vos besoins
                et de vous présenter ses services.
              </p>
              <p className="mt-3">
                Conformément à la <strong>Loi canadienne anti-pourriel (LCAP/CASL)</strong> et à la{' '}
                <strong>Loi 25 du Québec</strong> (Loi sur la protection des renseignements personnels dans le secteur
                privé), vous avez le droit de retirer votre consentement en tout temps en nous contactant à l'adresse
                courriel ou au numéro de téléphone indiqués à l'article 1. Votre demande sera traitée dans les meilleurs délais.
              </p>
            </Section>

            <Section title="5. Conservation des données">
              <p>
                Nous conservons vos informations personnelles aussi longtemps que nécessaire aux fins décrites dans la
                présente politique, ou conformément aux exigences légales applicables. Les données de prospects non
                convertis sont supprimées dans un délai raisonnable après la fin de nos échanges commerciaux.
              </p>
            </Section>

            <Section title="6. Sécurité">
              <p>
                Nous appliquons des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos
                informations contre tout accès non autorisé, divulgation, altération ou destruction. Toutefois, aucune
                transmission de données sur Internet n'est totalement sécurisée et nous ne pouvons garantir une
                sécurité absolue.
              </p>
            </Section>

            <Section title="7. Vos droits">
              <p>Conformément à la législation applicable, vous disposez des droits suivants :</p>
              <ul className="mt-3 space-y-2 pl-4">
                <Li><strong>Droit d'accès :</strong> obtenir une copie des informations personnelles que nous détenons sur vous</Li>
                <Li><strong>Droit de rectification :</strong> corriger toute information inexacte ou incomplète</Li>
                <Li><strong>Droit à l'effacement :</strong> demander la suppression de vos données dans les cas prévus par la loi</Li>
                <Li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment pour toute communication commerciale</Li>
              </ul>
              <p className="mt-4">
                Pour exercer l'un de ces droits, contactez-nous à{' '}
                <a href="mailto:info@agmds.com" className="text-primary font-medium hover:underline">info@agmds.com</a>.
              </p>
            </Section>

            <Section title="8. Cookies et données de navigation">
              <p>
                Notre site peut utiliser des technologies similaires aux cookies pour analyser l'utilisation du site à
                des fins internes (statistiques de visites, durée de session). Ces données sont anonymisées et ne sont
                pas transmises à des tiers.
              </p>
            </Section>

            <Section title="9. Modifications">
              <p>
                Nous nous réservons le droit de modifier la présente politique à tout moment. Toute modification sera
                publiée sur cette page avec la date de mise à jour. Nous vous encourageons à la consulter
                périodiquement.
              </p>
            </Section>

          </motion.div>

          <motion.div variants={FADE_UP} className="mt-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft size={14} />
              Retourner au site
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-black mb-3 pb-2 border-b border-black/8">{title}</h2>
      <div className="text-black/65 leading-relaxed text-[15px]">{children}</div>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}
