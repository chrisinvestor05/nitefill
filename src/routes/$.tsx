import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({
  component: NotFound,
});

function NotFound() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-lg px-4 pt-36 pb-24 text-center">
        <p className="text-sm text-teal">404</p>
        <h1 className="mt-2">Page Not Found</h1>
        <p className="mt-3 text-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="mt-8 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </main>
    </SiteShell>
  );
}
