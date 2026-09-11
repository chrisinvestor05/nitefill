import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { FaqSection, PricingSection } from "@/components/marketing/sections";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing – Nitefill" },
      {
        name: "description",
        content:
          "The Nitefill Room, Nitefill Pro, and Agency plans. Every plan includes a 7-day free trial.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <SiteShell>
      <div className="pt-16">
        <PricingSection />
        <FaqSection />
      </div>
    </SiteShell>
  );
}
