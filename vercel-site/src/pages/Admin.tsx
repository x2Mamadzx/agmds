import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Lock, RefreshCw, Users, Mail, Phone, Building2, Trash2, Activity, Clock, CheckCircle2, X, PhoneCall, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListLeads, useUpdateLead, useDeleteLead, useGetVisitStats, getListLeadsQueryKey, type Lead } from '@/lib/api';

const SESSION_KEY = 'mds_admin_password';

const STATUS_LABELS: Record<string, string> = {
  nouveau: 'Nouveau', contacte: 'Contacté', qualifie: 'Qualifié',
  proposition: 'Proposition', gagne: 'Gagné', perdu: 'Perdu',
};
const STATUS_ORDER = ['nouveau', 'contacte', 'qualifie', 'proposition', 'gagne', 'perdu'];
const SERVICE_LABELS: Record<string, string> = {
  videos: 'Vidéos organiques', pub: 'Publicité (Meta/Google/TikTok)',
  reseaux: 'Réseaux sociaux', contenu: 'Création de contenu',
  strategie: 'Stratégie de marque', site: 'Site web sur mesure', tout: 'Stratégie complète',
};

function LoginGate({ onAuthenticated }: { onAuthenticated: (password: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const leadsQuery = useListLeads({
    query: { enabled: false },
    request: { headers: { 'X-Admin-Password': password } },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    const result = await leadsQuery.refetch();
    if (result.isError) { setError(true); return; }
    sessionStorage.setItem(SESSION_KEY, password);
    onAuthenticated(password);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-32">
      <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[#e9e9e9] border border-black/10 rounded-2xl p-10 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Lock size={24} />
          </div>
          <h1 className="text-xl font-bold text-black">Espace admin</h1>
          <p className="text-sm text-black/50">Accès réservé à l'équipe MDS Marketing.</p>
        </div>
        <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full bg-[#eeeeee] border border-black/10 rounded-xl px-4 py-3 text-black placeholder:text-black/60 focus:outline-none focus:border-primary/60 text-sm" />
        {error && <p className="text-sm text-red-400 text-center">Mot de passe incorrect.</p>}
        <Button type="submit" className="w-full uppercase tracking-widest text-xs" disabled={leadsQuery.isFetching}>
          {leadsQuery.isFetching ? 'Vérification...' : 'Entrer'}
        </Button>
      </motion.form>
    </div>
  );
}

function LeadModal({ lead, password, onClose }: { lead: Lead; password: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const updateLead = useUpdateLead({
    request: { headers: { 'X-Admin-Password': password } },
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }) },
  });
  const deleteLead = useDeleteLead({
    request: { headers: { 'X-Admin-Password': password } },
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() }); onClose(); },
      onError: () => {
        window.alert(`Impossible de supprimer ${lead.nom}. Rafraîchissez la page et réessayez.`);
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      },
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Supprimer ${lead.nom} ? Cette action est irréversible.`)) {
      deleteLead.mutate({ id: lead.id });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-[#f5f5f5] border-b border-black/8 px-6 py-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-black text-lg text-black leading-tight truncate">{lead.nom}</p>
            {lead.entreprise && (
              <p className="text-sm text-black/50 flex items-center gap-1.5 mt-1 truncate">
                <Building2 size={13} className="shrink-0" /><span className="truncate">{lead.entreprise}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-black/40 hover:text-black transition-colors shrink-0 mt-0.5"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {lead.telephone && (
            <a href={`tel:${lead.telephone}`}
              className="flex items-center gap-3 w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl px-5 py-3.5 transition-colors font-semibold text-sm">
              <PhoneCall size={18} className="shrink-0" />
              <span className="truncate">Appeler — {lead.telephone}</span>
            </a>
          )}
          <a href={`mailto:${lead.courriel}`}
            className="flex items-center gap-3 w-full bg-[#f0f0f0] hover:bg-[#e8e8e8] text-black rounded-xl px-5 py-3.5 transition-colors font-semibold text-sm">
            <Mail size={18} className="shrink-0" />
            <span className="truncate">{lead.courriel}</span>
          </a>
        </div>

        <div className="px-6 pb-4 space-y-4 border-t border-black/8 pt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-black/40">Service</span>
            <span className="text-xs font-semibold text-black bg-primary/10 text-primary px-2.5 py-1 rounded-full truncate max-w-[60%] text-right">
              {SERVICE_LABELS[lead.service] ?? lead.service}
            </span>
          </div>
          {lead.message && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
                <MessageSquare size={11} /> Message
              </p>
              <p className="text-sm text-black/70 leading-relaxed bg-[#f5f5f5] rounded-xl px-4 py-3 break-words">{lead.message}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-black/40">Statut</p>
            <select value={lead.status}
              onChange={(e) => updateLead.mutate({ id: lead.id, data: { status: e.target.value as Lead['status'] } })}
              className="w-full bg-[#f5f5f5] border border-black/10 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-primary/60">
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 pb-5 pt-2 flex justify-end">
          <button type="button" onClick={handleDelete} disabled={deleteLead.isPending}
            className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 flex items-center gap-1.5">
            <Trash2 size={13} /> Supprimer ce prospect
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LeadCard({ lead, password }: { lead: Lead; password: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button type="button" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onClick={() => setOpen(true)}
        className="w-full text-left bg-[#e9e9e9] hover:bg-[#e2e2e2] active:bg-[#dcdcdc] border border-black/10 hover:border-primary/30 rounded-xl p-4 space-y-2.5 transition-all duration-200 group cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-black truncate">{lead.nom}</p>
            {lead.entreprise && (
              <p className="text-xs text-black/50 flex items-center gap-1 mt-0.5 truncate">
                <Building2 size={11} className="shrink-0" /><span className="truncate">{lead.entreprise}</span>
              </p>
            )}
          </div>
          {lead.telephone && (
            <span onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${lead.telephone}`; }} role="button"
              title={`Appeler ${lead.nom}`}
              className="shrink-0 w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-sm transition-colors">
              <Phone size={14} />
            </span>
          )}
        </div>
        <p className="text-xs text-black/50 flex items-center gap-1.5 truncate">
          <Mail size={11} className="shrink-0" /><span className="truncate">{lead.courriel}</span>
        </p>
        <p className="text-xs text-black/55 uppercase tracking-wider truncate">{SERVICE_LABELS[lead.service] ?? lead.service}</p>
        {lead.message && <p className="text-xs text-black/40 line-clamp-2 break-words">{lead.message}</p>}
      </motion.button>
      <AnimatePresence>
        {open && <LeadModal lead={lead} password={password} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest > 0 ? `${minutes}m ${rest}s` : `${minutes}m`;
}

function TrafficStatCard({ label, count, avgDurationSeconds, conversionRate, converted }: {
  label: string; count: number; avgDurationSeconds: number; conversionRate: number; converted: number;
}) {
  return (
    <div className="bg-[#e9e9e9] border border-black/10 rounded-xl p-5 space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-black/50">{label}</p>
      <p className="text-3xl font-black text-black">{count.toLocaleString('fr-CA')}</p>
      <div className="flex items-center gap-4 text-xs text-black/60 pt-1">
        <span className="flex items-center gap-1.5">
          <Clock size={13} className="text-primary" /> {formatDuration(avgDurationSeconds)} en moyenne
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-primary" /> {converted} formulaire{converted > 1 ? 's' : ''} ({Math.round(conversionRate * 100)}%)
        </span>
      </div>
    </div>
  );
}

function TrafficSection({ password }: { password: string }) {
  const statsQuery = useGetVisitStats({ request: { headers: { 'X-Admin-Password': password } } });
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-black flex items-center gap-2">
          <Activity className="text-primary" size={20} /> Trafic du site
        </h2>
        <Button variant="outline" size="sm" onClick={() => statsQuery.refetch()}>
          <RefreshCw size={14} className="mr-2" /> Rafraîchir
        </Button>
      </div>
      {statsQuery.isLoading ? (
        <p className="text-black/50 text-sm">Chargement...</p>
      ) : statsQuery.data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TrafficStatCard label="Dernières 24 heures"
            count={statsQuery.data.last24h.count} avgDurationSeconds={statsQuery.data.last24h.avgDurationSeconds}
            conversionRate={statsQuery.data.last24h.conversionRate} converted={statsQuery.data.last24h.converted} />
          <TrafficStatCard label="7 derniers jours"
            count={statsQuery.data.last7d.count} avgDurationSeconds={statsQuery.data.last7d.avgDurationSeconds}
            conversionRate={statsQuery.data.last7d.conversionRate} converted={statsQuery.data.last7d.converted} />
        </div>
      ) : (
        <p className="text-black/50 text-sm">Impossible de charger les statistiques.</p>
      )}
    </div>
  );
}

function Dashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const leadsQuery = useListLeads({ request: { headers: { 'X-Admin-Password': password } } });

  if (leadsQuery.isError) { onLogout(); return null; }

  const leads = leadsQuery.data ?? [];
  const byStatus = STATUS_ORDER.map((status) => ({ status, leads: leads.filter((l) => l.status === status) }));

  return (
    <div className="min-h-screen px-6 py-32 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-black flex items-center gap-3">
            <Users className="text-primary" /> Pipeline des prospects
          </h1>
          <p className="text-black/50 text-sm mt-1">{leads.length} prospect{leads.length > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => leadsQuery.refetch()}>
            <RefreshCw size={14} className="mr-2" /> Rafraîchir
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout}>Se déconnecter</Button>
        </div>
      </div>

      <TrafficSection password={password} />

      {leadsQuery.isLoading ? (
        <p className="text-black/50">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {byStatus.map(({ status, leads: statusLeads }) => (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-black/60">{STATUS_LABELS[status]}</h2>
                <span className="text-xs text-black/55 bg-black/5 rounded-full px-2 py-0.5">{statusLeads.length}</span>
              </div>
              <div className="space-y-3">
                {statusLeads.map((lead) => <LeadCard key={lead.id} lead={lead} password={password} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState<string | null>(null);
  useEffect(() => { const stored = sessionStorage.getItem(SESSION_KEY); if (stored) setPassword(stored); }, []);
  if (!password) return <LoginGate onAuthenticated={setPassword} />;
  return <Dashboard password={password} onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setPassword(null); }} />;
}
