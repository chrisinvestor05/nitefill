import type { PlanId } from "@/data/content";

export type PromoGrant = {
  code: string;
  planId: PlanId;
  dailyLimit: number;
  label: string;
};

const GRANTS: Record<string, PromoGrant> = {
  FULLHOUSE: {
    code: "FULLHOUSE",
    planId: "pro",
    dailyLimit: 100,
    label: "Nitefill Pro — complimentary",
  },
};

export function normalizePromo(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s_-]+/g, "");
}

export function lookupPromo(raw: string): PromoGrant | null {
  const key = normalizePromo(raw);
  return GRANTS[key] ?? null;
}

export const PROMO_STORAGE_KEY = "nitefill.promo";
