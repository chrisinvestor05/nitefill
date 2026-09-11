import { createFileRoute } from "@tanstack/react-router";
import { AuthPanel } from "@/components/auth/auth-panel";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in – Nitefill" }] }),
  component: LoginPage,
});

function LoginPage() {
  return <AuthPanel mode="login" />;
}
