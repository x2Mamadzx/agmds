import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";

// Basic in-memory brute-force guard for the admin password gate: locks an IP
// out for a short window after too many failed attempts. Adequate for a
// single-instance dev/small-scale deployment; not distributed across replicas.
// Shared across all admin-gated routes so limits apply consistently regardless
// of which endpoint an attacker probes.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;
const failedAttempts = new Map<string, { count: number; firstAttemptAt: number }>();

function isRateLimited(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  entry.count += 1;
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function requireAdmin(req: Request): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) return false;

  const ip = req.ip ?? "unknown";
  if (isRateLimited(ip)) return false;

  const provided = req.header("x-admin-password");
  const ok = !!provided && safeCompare(provided, expected);
  if (!ok) recordFailedAttempt(ip);
  return ok;
}
