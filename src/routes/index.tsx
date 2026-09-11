import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { Hero } from "@/components/marketing/hero";
import {
  DemoSection,
  FaqSection,
  FinalCta,
  HowItWorksSection,
  PricingSection,
  ProblemSection,
  ProfessionalsSection,
  RoomSection,
  SafetySection,
  TestimonialsSection,
} from "@/components/marketing/sections";
import { FAQS } from "@/data/content";

const SOFTWARE_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Nitefill",
  alternateName: "Nitefill AI",
  applicationCategory: "MarketingApplication",
  operatingSystem: "Web",
  url: "https://nitefill.com",
  description:
    "Nitefill is an AI-powered outreach platform that helps DJs, promoters, and nightlife brands fill events by automating Instagram DMs, qualifying leads, and driving bookings.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "35",
    highPrice: "199",
  },
  creator: { "@type": "Organization", name: "Nitefill", url: "https://nitefill.com" },
  audience: {
    "@type": "Audience",
    audienceType: ["DJs", "Promoters", "Nightlife brands", "Event organizers", "Venues"],
  },
};

function faqLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nitefill – AI Outreach for DJs, Promoters & Nightlife Brands" },
      {
        name: "description",
        content:
          "Nitefill helps DJs, promoters, and nightlife brands fill events using AI-powered Instagram outreach, smart targeting, and safe-paced DM automation.",
      },
      {
        name: "keywords",
        content:
          "DJ marketing, promoter tools, nightlife growth, Instagram outreach, AI DM automation, event promotion",
      },
    ],
    scripts: [
      { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(SOFTWARE_LD) } },
      { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify(faqLd()) } },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <Hero />
      <ProblemSection />
      <HowItWorksSection />
      <DemoSection />
      <RoomSection />
      <ProfessionalsSection />
      <TestimonialsSection />
      <PricingSection />
      <SafetySection />
      <FaqSection />
      <FinalCta />
    </SiteShell>
  );
}
