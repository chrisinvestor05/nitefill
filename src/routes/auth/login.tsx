import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Log in – Nitefill" }] }),
  component: () => <Navigate to="/login" />,
});
