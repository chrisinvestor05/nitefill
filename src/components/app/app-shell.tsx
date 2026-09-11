import { useEffect } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Instagram,
  LayoutDashboard,
  Megaphone,
  Settings,
  Users,
} from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Wordmark } from "@/components/brand/logo";
import { AuthSlot } from "@/components/layout/auth-slot";
import { cn } from "@/lib/utils";
import { ensureProfile, redeemPromo } from "@/lib/server/profile";
import { processSends } from "@/lib/server/campaigns";
import { lookupPromo, PROMO_STORAGE_KEY } from "@/lib/promos";

const LINKS = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/app/audience", label: "Audience", icon: Users },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/room", label: "The Room", icon: BookOpen },
  { to: "/app/connect", label: "Instagram", icon: Instagram },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) return;
    let plan = "pro";
    let cycle = "monthly";
    try {
      plan = localStorage.getItem("nitefill.plan") || "pro";
      cycle = localStorage.getItem("nitefill.cycle") || "monthly";
    } catch {
      /* ignore */
    }
    void (async () => {
      await ensureProfile({
        data: {
          name: user.displayName,
          email: user.primaryEmail,
          planId: plan,
          billingCycle: cycle,
        },
      });
      try {
        const pending = localStorage.getItem(PROMO_STORAGE_KEY);
        if (pending && lookupPromo(pending)) {
          await redeemPromo({ data: { code: pending } });
          localStorage.removeItem(PROMO_STORAGE_KEY);
        }
      } catch {
        /* redeem errors surface in Settings */
      }
      await processSends({ data: {} });
    })();
  }, [user]);

  if (isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy text-muted">
        Loading your room…
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="min-h-screen bg-navy lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-fg/8 lg:flex lg:flex-col lg:py-6">
        <div className="px-5 pb-6">
          <Wordmark to="/app" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="App">
          {LINKS.map((l) => {
            const Icon = l.icon;
            const active = "exact" in l && l.exact ? pathname === l.to : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-teal/10 text-teal" : "text-muted hover:bg-fg/5 hover:text-fg",
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-fg/8 px-4 sm:px-6">
          <div className="lg:hidden">
            <Wordmark to="/app" />
          </div>
          <nav className="hidden gap-1 overflow-x-auto md:flex lg:hidden">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-muted hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <AuthSlot compact />
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-fg/8 px-3 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-muted hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
