import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";

export function AuthSlot({ compact = false }: { compact?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-9 w-28 animate-pulse rounded-full bg-fg/10" aria-hidden />;
  }
  if (user) {
    return (
      <div className="flex items-center gap-3">
        {!compact && (
          <Link
            to="/app"
            className="hidden text-sm font-medium text-muted hover:text-fg sm:inline"
          >
            Dashboard
          </Link>
        )}
        <div className="text-fg [&_button]:text-muted [&_button]:hover:text-fg">
          <UserButton />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className="hidden px-3 py-2 text-sm font-medium text-muted hover:text-fg sm:inline"
      >
        Log in
      </Link>
      <Link to="/signup">
        <Button size="sm" className="rounded-full px-4">
          Start free trial
        </Button>
      </Link>
    </div>
  );
}
