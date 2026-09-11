import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { planById, type BillingCycle, type PlanId } from "@/data/content";
import { lookupPromo } from "@/lib/promos";
import { mintExtensionToken } from "./sender";

export type Profile = {
  userId: string;
  name: string | null;
  email: string | null;
  instagramHandle: string | null;
  instagramConnected: boolean;
  planId: PlanId;
  billingCycle: BillingCycle;
  trialEndsAt: string | null;
  planStatus: string;
  promoCode: string | null;
  city: string | null;
  dailyLimit: number;
  createdAt: string;
};

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    userId: String(row.user_id),
    name: (row.name as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    instagramHandle: (row.instagram_handle as string | null) ?? null,
    instagramConnected: Boolean(row.instagram_connected),
    planId: (row.plan_id as PlanId) || "pro",
    billingCycle: (row.billing_cycle as BillingCycle) || "monthly",
    trialEndsAt: row.trial_ends_at ? String(row.trial_ends_at) : null,
    planStatus: String(row.plan_status ?? "trial"),
    promoCode: (row.promo_code as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    dailyLimit: Number(row.daily_limit ?? 35),
    createdAt: String(row.created_at),
  };
}

export function planStatusLabel(status: string): string {
  if (status === "comp") return "Complimentary";
  if (status === "trial") return "7-day trial";
  if (status === "canceled") return "Canceled";
  if (status === "active") return "Active";
  return status;
}

export const getProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from profiles where user_id = ${context.userId} limit 1
    `;
    return rows[0] ? rowToProfile(rows[0]) : null;
  });

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      name?: string | null;
      email?: string | null;
      planId?: string;
      billingCycle?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<Record<string, unknown>>`
      select * from profiles where user_id = ${context.userId} limit 1
    `;
    if (existing[0]) {
      const current = rowToProfile(existing[0]);
      const locked = current.planStatus === "comp";
      const planId = locked ? undefined : data.planId ? planById(data.planId).id : undefined;
      const cycle =
        locked
          ? undefined
          : data.billingCycle === "yearly" || data.billingCycle === "monthly"
            ? data.billingCycle
            : undefined;
      if (!existing[0].extension_token) {
        await sql`
          update profiles set extension_token = ${mintExtensionToken()}
          where user_id = ${context.userId}
        `;
      }
      if (planId || cycle || data.name || data.email) {
        await sql`
          update profiles
          set
            name = coalesce(${data.name ?? null}, name),
            email = coalesce(${data.email ?? null}, email),
            plan_id = coalesce(${planId ?? null}, plan_id),
            billing_cycle = coalesce(${cycle ?? null}, billing_cycle)
          where user_id = ${context.userId}
        `;
      }
      const refreshed = await sql<Record<string, unknown>>`
        select * from profiles where user_id = ${context.userId} limit 1
      `;
      return rowToProfile(refreshed[0]!);
    }

    const plan = planById(data.planId ?? "pro");
    const cycle: BillingCycle = data.billingCycle === "yearly" ? "yearly" : "monthly";
    const token = mintExtensionToken();
    const trialEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await sql`
      insert into profiles (
        user_id, name, email, plan_id, billing_cycle, trial_ends_at, plan_status, daily_limit, extension_token
      ) values (
        ${context.userId},
        ${data.name ?? null},
        ${data.email ?? null},
        ${plan.id},
        ${cycle},
        ${trialEnds},
        ${"trial"},
        ${35},
        ${token}
      )
    `;
    const created = await sql<Record<string, unknown>>`
      select * from profiles where user_id = ${context.userId} limit 1
    `;
    return rowToProfile(created[0]!);
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      name?: string;
      city?: string;
      dailyLimit?: number;
      instagramHandle?: string | null;
      instagramConnected?: boolean;
      planId?: string;
      billingCycle?: string;
      planStatus?: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<Record<string, unknown>>`
      select plan_status from profiles where user_id = ${context.userId} limit 1
    `;
    const locked = String(existing[0]?.plan_status ?? "") === "comp";
    const daily =
      typeof data.dailyLimit === "number"
        ? Math.min(100, Math.max(10, Math.round(data.dailyLimit)))
        : null;
    const planId = locked ? null : data.planId ? planById(data.planId).id : null;
    const cycle =
      locked
        ? null
        : data.billingCycle === "yearly" || data.billingCycle === "monthly"
          ? data.billingCycle
          : null;
    const nextStatus = locked ? null : (data.planStatus ?? null);
    await sql`
      update profiles
      set
        name = coalesce(${data.name ?? null}, name),
        city = coalesce(${data.city ?? null}, city),
        daily_limit = coalesce(${daily}, daily_limit),
        instagram_handle = coalesce(${data.instagramHandle ?? null}, instagram_handle),
        instagram_connected = coalesce(${data.instagramConnected ?? null}, instagram_connected),
        plan_id = coalesce(${planId}, plan_id),
        billing_cycle = coalesce(${cycle}, billing_cycle),
        plan_status = coalesce(${nextStatus}, plan_status)
      where user_id = ${context.userId}
    `;
    const rows = await sql<Record<string, unknown>>`
      select * from profiles where user_id = ${context.userId} limit 1
    `;
    return rows[0] ? rowToProfile(rows[0]) : null;
  });

export const redeemPromo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { code: string }) => input)
  .handler(async ({ context, data }) => {
    const grant = lookupPromo(data.code ?? "");
    if (!grant) {
      throw new Error("That code isn't valid. Check the spelling and try again.");
    }
    const sql = await getSql();
    const existing = await sql<Record<string, unknown>>`
      select * from profiles where user_id = ${context.userId} limit 1
    `;
    if (!existing[0]) {
      throw new Error("Create your account first, then redeem the code in Settings.");
    }
    await sql`
      update profiles
      set
        plan_id = ${grant.planId},
        plan_status = ${"comp"},
        trial_ends_at = ${null},
        daily_limit = ${grant.dailyLimit}
      where user_id = ${context.userId}
    `;
    const rows = await sql<Record<string, unknown>>`
      select * from profiles where user_id = ${context.userId} limit 1
    `;
    return rowToProfile(rows[0]!);
  });
