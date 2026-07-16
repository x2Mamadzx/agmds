import { useEffect, useRef } from 'react';
import { useCreateVisit, useUpdateVisit } from '@workspace/api-client-react';

const VISIT_SESSION_KEY = 'mds_visit_session_id';
const VISIT_LAST_SEEN_KEY = 'mds_visit_last_seen';
const VISIT_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

function createSessionId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateSessionId(): string {
  const existingId = sessionStorage.getItem(VISIT_SESSION_KEY);
  const lastSeen = Number(sessionStorage.getItem(VISIT_LAST_SEEN_KEY) ?? 0);
  const isStale = !existingId || !lastSeen || Date.now() - lastSeen > VISIT_INACTIVITY_TIMEOUT_MS;

  const id = isStale ? createSessionId() : existingId;
  sessionStorage.setItem(VISIT_SESSION_KEY, id);
  sessionStorage.setItem(VISIT_LAST_SEEN_KEY, String(Date.now()));
  return id;
}

export function useVisitTracking() {
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
