import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Lock, RefreshCw, Users, Mail, Phone, Building2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useListLeads, useUpdateLead, useDeleteLead, getListLeadsQueryKey, type Lead } from '@workspace/api-client-react';

const SESSION_KEY = 'mds_admin_password';

const STATUS_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  qualifie: 'Qualifié',
  proposition: 'Proposition',
  gagne: 'Gagné',
  perdu: 'Perdu',
};

const STATUS_ORDER = ['nouveau', 'contacte', 'qualifie', 'proposition', 'gagne', 'perdu'];

const SERVICE_LABELS: Record<string, string> = {
  videos: 'Vidéos organiques',
  pub: 'Publicité (Meta/Google/TikTok)',
  reseaux: 'Réseaux sociaux',
  contenu: 'Création de contenu',
  strategie: 'Stratégie de marque',
  tout: 'Stratégie complète',
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
    if (result.isError) {
      setError(true);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, password);
    onAuthenticated(password);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-32">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#e9e9e9] border border-black/10 rounded-2xl p-10 w-full max-w-sm space-y-6"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Lock size={24} />
          </div>
          <h1 className="text-xl font-bold text-black">Espace admin</h1>
          <p className="text-sm text-black/50">Accès réservé à l'équipe MDS Marketing.</p>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full bg-[#eeeeee] border border-black/10 rounded-xl px-4 py-3 text-black placeholder:text-black/60 focus:outline-none focus:border-primary/60 text-sm"
        />
        {error && <p className="text-sm text-red-400 text-center">Mot de passe incorrect.</p>}
        <Button type="submit" className="w-full uppercase tracking-widest text-xs" disabled={leadsQuery.isFetching}>
          {leadsQuery.isFetching ? 'Vérification...' : 'Entrer'}
        </Button>
      </motion.form>
    </div>
  );
}

function LeadCard({ lead, password }: { lead: Lead; password: string }) {
  const queryClient = useQueryClient();
  const updateLead = useUpdateLead({
    request: { headers: { 'X-Admin-Password': password } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      },
    },
  });
  const deleteLead = useDeleteLead({
    request: { headers: { 'X-Admin-Password': password } },
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      },
      onError: () => {
        window.alert(
          `Impossible de supprimer ${lead.nom}. Le prospect a peut-être déjà été supprimé ou votre session a expiré. Rafraîchissez la page et réessayez.`
        );
        queryClient.invalidateQueries({ queryKey: getListLeadsQueryKey() });
      },
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Supprimer le prospect ${lead.nom} ? Cette action est irréversible.`)) {
      deleteLead.mutate({ id: lead.id });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#e9e9e9] border border-black/10 rounded-xl p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-black">{lead.nom}</p>
          {lead.entreprise && (
            <p className="text-xs text-black/50 flex items-center gap-1 mt-0.5">
              <Building2 size={12} /> {lead.entreprise}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteLead.isPending}
          aria-label={`Supprimer ${lead.nom}`}
          className="text-black/50 hover:text-red-400 transition-colors shrink-0 disabled:opacity-40"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="space-y-1 text-xs text-black/60">
        <a href={`mailto:${lead.courriel}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
          <Mail size={12} /> {lead.courriel}
        </a>
        {lead.telephone && (
          <a href={`tel:${lead.telephone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Phone size={12} /> {lead.telephone}
          </a>
        )}
      </div>
      <p className="text-xs text-black/55 uppercase tracking-wider">{SERVICE_LABELS[lead.service] ?? lead.service}</p>
      {lead.message && <p className="text-xs text-black/50 line-clamp-3">{lead.message}</p>}
      <select
        value={lead.status}
        onChange={(e) => updateLead.mutate({ id: lead.id, data: { status: e.target.value as Lead['status'] } })}
        className="w-full bg-[#f2f2f2] border border-black/10 rounded-lg px-2 py-2 text-xs text-black focus:outline-none focus:border-primary/60"
      >
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status}>{STATUS_LABELS[status]}</option>
        ))}
      </select>
    </motion.div>
  );
}

function Dashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const leadsQuery = useListLeads({ request: { headers: { 'X-Admin-Password': password } } });

  if (leadsQuery.isError) {
    onLogout();
    return null;
  }

  const leads = leadsQuery.data ?? [];
  const byStatus = STATUS_ORDER.map((status) => ({
    status,
    leads: leads.filter((l) => l.status === status),
  }));

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
                {statusLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} password={password} />
                ))}
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

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) setPassword(stored);
  }, []);

  if (!password) {
    return <LoginGate onAuthenticated={setPassword} />;
  }

  return (
    <Dashboard
      password={password}
      onLogout={() => {
        sessionStorage.removeItem(SESSION_KEY);
        setPassword(null);
      }}
    />
  );
}
