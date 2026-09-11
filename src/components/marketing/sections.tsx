import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Minus, Plus, Shield } from "lucide-react";
import {
  DEMO_STEPS,
  FAQS,
  HOW_IT_WORKS,
  PLANS,
  PROBLEM_POINTS,
  PROFESSIONALS,
  ROOM_PILLARS,
  TESTIMONIALS,
  type BillingCycle,
  type Plan,
  monthlyEquivalent,
} from "@/data/content";
import { formatMoneyExact, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoomModal } from "./room-modal";

export function ProblemSection() {
  return (
    <section className="border-t border-fg/6 px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <Badge tone="danger">The Problem</Badge>
        <h2 className="max-w-3xl text-fg">Great nights don't fail because of the music.</h2>
        <p className="text-lg text-muted">They fail because nobody built the room.</p>
        <div className="grid items-center gap-8 pt-2 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden rounded-2xl border border-fg/10">
            <img
              src="/images/empty-room.jpg"
              alt="A DJ playing to an empty dancefloor"
              width={1536}
              height={1024}
              className="block h-auto w-full"
            />
          </div>
          <ul className="space-y-4">
            {PROBLEM_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <Minus className="mt-0.5 h-5 w-5 shrink-0 text-danger" strokeWidth={2.5} />
                <span className="text-sm leading-relaxed text-muted sm:text-base">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="max-w-3xl pt-4 text-muted">
          Nitefill exists to break that loop. Personal invitations, sent to people
          who already match the music, the venue, and the city — run as a
          repeatable system, not last-minute effort.
        </p>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-t border-fg/6 px-4 pt-8 pb-16 sm:px-6 sm:pt-12 sm:pb-24 lg:pt-16 lg:pb-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 space-y-4 text-center sm:mb-16">
          <h2>How It Works</h2>
          <p className="text-lg text-muted">Three steps. About five minutes to set up.</p>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <article
              key={step.number}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-fg/8 bg-surface p-6 pt-7 transition-transform duration-300 hover:-translate-y-1 hover:border-teal/40"
            >
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="absolute top-12 -right-3 hidden h-0.5 w-6 bg-gradient-to-r from-teal/40 to-transparent lg:block" />
              )}
              <div className="absolute inset-x-0 top-0 h-px bg-fg/10">
                <div className="h-full w-10 bg-teal transition-all duration-500 group-hover:w-full" />
              </div>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[40px] leading-none font-semibold tracking-tight text-orange">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-2 text-fg">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.description}</p>
              <p className="mt-5 border-t border-fg/8 pt-4 text-[12px] text-fg/45">
                {step.proof}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DemoSection() {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<"male" | "female" | "all">("male");
  const counts = { male: 1247, female: 1600, all: 2847 };
  const labels = { male: "Male", female: "Female", all: "All genders" };

  return (
    <section id="demo" className="border-t border-fg/6 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 space-y-3 text-center">
          <p className="text-sm font-medium text-muted">See It In Action</p>
          <h2 className="italic">
            Watch Nitefill <span className="text-orange not-italic">Work</span>
          </h2>
          <p className="text-lg text-muted">
            This is the campaign builder. Two steps from an empty campaign to invites going out.
          </p>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-4">
            {DEMO_STEPS.map((s, i) => {
              const active = step === i;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    "group relative w-full rounded-2xl border p-5 text-left transition-colors sm:p-6",
                    active
                      ? "border-teal/50 bg-surface"
                      : "border-fg/8 bg-surface/50 hover:border-fg/20",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                        active ? "bg-teal text-navy" : "bg-panel text-teal",
                      )}
                    >
                      <span className="font-display text-lg font-semibold">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-fg">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted">{s.description}</p>
                      <p className="mt-2 text-xs text-teal">{s.example}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="overflow-hidden rounded-2xl border border-fg/12 bg-surface shadow-2xl">
            {step === 0 ? (
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-fg">Target Filters</h4>
                  <span className="rounded-md border border-teal/30 bg-teal/10 px-3 py-1 text-xs text-teal">
                    Example: 2,847 matches
                  </span>
                </div>
                <div>
                  <p className="mb-3 text-sm text-muted">Select Gender</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["male", "female", "all"] as const).map((key) => {
                      const on = gender === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setGender(key)}
                          className={cn(
                            "rounded-lg border px-4 py-3 text-center text-sm transition-colors",
                            on
                              ? "border-teal/50 bg-teal/10 text-fg"
                              : "border-fg/8 bg-panel text-fg/60 hover:border-fg/20",
                          )}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-full border-2",
                                on ? "border-teal" : "border-fg/30",
                              )}
                            >
                              {on && <span className="h-2 w-2 rounded-full bg-teal" />}
                            </span>
                            {key === "all" ? "All" : key === "male" ? "Male" : "Female"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-lg border border-fg/8 bg-panel p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Current Selection</span>
                    <span className="text-sm text-teal">{labels[gender]}</span>
                  </div>
                  <p className="mt-2 text-xs text-subtle">
                    Targeting {counts[gender].toLocaleString()} people near you from seed accounts
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-5 sm:p-6">
                <h4 className="font-semibold text-fg">Invite, rewritten per person</h4>
                <p className="rounded-lg border border-fg/10 bg-panel px-4 py-3 text-sm leading-relaxed text-muted">
                  You write one message. We rewrite it around their profile and send them one at a time.
                </p>
                <article className="rounded-xl border border-fg/8 bg-navy p-4 text-sm leading-relaxed text-muted">
                  hey Maya — saw you were at Ministry a couple of weeks back. I’m putting on a rooftop thing in London on the 14th, proper house line-up. Reckon it’d be your kind of night?
                </article>
                <p className="text-xs text-subtle">No two sends identical · you approve the source copy first</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function RoomSection() {
  const [open, setOpen] = useState(false);
  return (
    <section id="room" className="border-t border-fg/6 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 space-y-4 text-center">
          <Badge>Our Speciality</Badge>
          <h2>Join the Nitefill Community</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Access exclusive courses, proven strategies, and a network of DJs and
            promoters who've mastered the business of staying booked.
          </p>
        </div>
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <img
            src="/images/room-modules.png"
            alt="The Nitefill Room module list — 18 modules and 136 lessons"
            className="w-full rounded-2xl border border-fg/10"
          />
          <div>
            <ul className="space-y-3">
              {ROOM_PILLARS.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                  <span className="text-sm text-muted sm:text-base">{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setOpen(true)}>Join The Room</Button>
              <Link to="/signup" search={{ plan: "starter", cycle: "monthly" }}>
                <Button variant="ghost">Start the trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {open && <RoomModal onClose={() => setOpen(false)} />}
    </section>
  );
}

export function ProfessionalsSection() {
  return (
    <section className="border-t border-fg/6 px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 space-y-4 text-center sm:mb-16">
          <h2>Built for Music Professionals</h2>
          <p className="text-lg text-muted">
            Whether you're spinning tracks, running events, or managing a venue.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:gap-8">
          {PROFESSIONALS.map((card) => (
            <article
              key={card.title}
              className="relative h-full overflow-hidden rounded-2xl border border-fg/8 bg-surface p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-fg/20 sm:p-8"
            >
              <div
                className="mb-6 h-40 w-full rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <p className="text-xs font-medium tracking-wider text-teal uppercase">{card.tagline}</p>
              <h3 className="mt-1 mb-4 text-fg">{card.title}</h3>
              <ul className="space-y-2">
                {card.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const rowA = [...TESTIMONIALS, ...TESTIMONIALS];
  const rowB = [...TESTIMONIALS.slice(2), ...TESTIMONIALS.slice(0, 2), ...TESTIMONIALS.slice(2)];
  return (
    <section id="testimonials" className="border-t border-fg/6 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-10 space-y-3 text-center">
          <p className="text-xs font-medium tracking-wider text-teal uppercase">Our Testimonials</p>
          <h2>Why The Nightlife Scene Is Choosing Nitefill</h2>
          <p className="mx-auto max-w-2xl text-base text-muted sm:text-lg">
            Genuine results from creators filling rooms and building their audience
          </p>
        </div>
        <div className="group/row space-y-4 overflow-hidden sm:space-y-6">
          <Marquee items={rowA} dir="right" />
          <Marquee items={rowB} dir="left" />
        </div>
      </div>
    </section>
  );
}

function Marquee({
  items,
  dir,
}: {
  items: typeof TESTIMONIALS;
  dir: "left" | "right";
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-navy to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-navy to-transparent sm:w-32" />
      <div className={cn("flex", dir === "left" ? "animate-marquee-left" : "animate-marquee-right")}>
        {items.map((t, i) => (
          <figure
            key={`${t.name}-${i}`}
            className="mx-2 w-[320px] shrink-0 rounded-2xl border border-fg/8 bg-surface p-5 sm:w-[380px] sm:p-6"
          >
            <div className="mb-3 flex items-center gap-3">
              <img
                src={t.image}
                alt=""
                className="h-11 w-11 rounded-full object-cover"
              />
              <div>
                <figcaption className="text-sm font-medium text-fg">{t.name}</figcaption>
                <p className="text-xs text-subtle">
                  {t.role} · {t.location}
                </p>
              </div>
            </div>
            <blockquote className="text-sm leading-relaxed text-muted">“{t.quote}”</blockquote>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function PricingSection() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  return (
    <section id="pricing" className="border-t border-fg/6 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-medium tracking-wider text-teal uppercase">Simple Pricing</p>
          <h2 className="mb-4">Choose Your Plan</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted">
            Start free, upgrade when you're ready. All plans include a 7-day free trial.
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-fg/10 bg-surface p-1.5">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                cycle === "monthly" ? "bg-teal text-navy" : "text-fg/60 hover:text-fg",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
                cycle === "yearly" ? "bg-teal text-navy" : "text-fg/60 hover:text-fg",
              )}
            >
              Yearly
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  cycle === "yearly" ? "bg-navy/20 text-navy" : "bg-success/20 text-success",
                )}
              >
                Save
              </span>
            </button>
          </div>
        </div>
        <div className="flex flex-col items-stretch justify-center gap-6 md:flex-row md:flex-wrap">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
  const popular = plan.popular;
  const amount = monthlyEquivalent(plan, cycle);
  return (
    <div
      className={cn(
        "relative w-full md:w-[calc(50%-0.75rem)] lg:w-[360px]",
        popular && "lg:-mt-4 lg:mb-4",
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <div className="rounded-full bg-orange px-4 py-1.5 text-xs font-semibold text-fg shadow-lg shadow-orange/30">
            Most Popular
          </div>
        </div>
      )}
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-3xl border backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02]",
          popular
            ? "border-orange/50 shadow-2xl shadow-orange/10"
            : "border-fg/10 hover:border-fg/20",
        )}
        style={{
          background: popular
            ? "linear-gradient(145deg, rgba(238,108,77,0.15) 0%, rgba(15,36,74,0.9) 30%, rgba(10,29,62,0.95) 100%)"
            : "linear-gradient(145deg, rgba(15,36,74,0.8) 0%, rgba(10,29,62,0.9) 100%)",
        }}
      >
        <div className="relative z-10 p-8">
          <h3 className="mb-2 text-fg">{plan.name}</h3>
          <p className="mb-6 min-h-12 text-sm text-muted">{plan.description}</p>
          <div className="mb-6">
            <span className="font-display text-4xl font-semibold text-fg">
              {formatMoneyExact(amount)}
            </span>
            <span className="text-sm text-subtle"> /mo</span>
            {cycle === "yearly" && (
              <p className="mt-1 text-xs text-subtle">
                billed {formatMoneyExact(plan.yearlyPrice)} yearly
              </p>
            )}
          </div>
          <Link to="/signup" search={{ plan: plan.id, cycle }}>
            <Button
              variant={popular ? "orange" : "quiet"}
              className="mb-8 w-full py-3.5"
            >
              {plan.cta}
            </Button>
          </Link>
          <ul className="space-y-3">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-fg/6 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3">Questions, answered</h2>
          <p className="text-muted">The practical stuff before you start a trial.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const on = open === i;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-fg/8 bg-surface transition-colors hover:border-fg/20"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-6"
                  aria-expanded={on}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => setOpen(on ? null : i)}
                >
                  <span className="pr-8 font-medium text-fg">{faq.question}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panel">
                    {on ? (
                      <Minus className="h-4 w-4 text-teal" />
                    ) : (
                      <Plus className="h-4 w-4 text-teal" />
                    )}
                  </span>
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  hidden={!on}
                  className={cn(
                    "overflow-hidden px-4 pb-5 sm:px-6",
                    on ? "block" : "hidden",
                  )}
                >
                  <p className="text-sm leading-relaxed text-muted">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 rounded-2xl border border-fg/8 bg-surface p-6 text-center sm:p-8">
          <h3 className="mb-3 text-fg">Still have questions?</h3>
          <p className="mb-6 text-muted">Our team is here to help you get started with Nitefill.</p>
          <Link to="/contact">
            <Button variant="teal">Contact Support</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SafetySection() {
  return (
    <section className="border-t border-fg/6 px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-[1280px] items-center gap-8 rounded-3xl border border-fg/8 bg-surface p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <Badge className="mb-4">
            <Shield className="h-3.5 w-3.5" />
            SafeSend
          </Badge>
          <h2 className="mb-3">Safe, paced, respectful</h2>
          <p className="text-muted">
            You set the daily limit. SafeSend spreads those messages across the
            day with uneven gaps rather than sending them in a block. New
            campaigns start at 35 a day, which is deliberately low. We never ask
            for your Instagram password.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-muted">
          {[
            "Human-paced sending with variable spacing",
            "You review the source copy before anything goes out",
            "Replies land in your Instagram inbox, not ours",
            "Disconnect any time from the dashboard",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-teal" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="relative mx-auto max-w-4xl space-y-8 overflow-hidden rounded-3xl border border-fg/10 px-6 py-14 text-center sm:px-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-teal) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative">
          <h2>
            Turn your Instagram into a{" "}
            <span className="bg-gradient-to-r from-brand to-teal bg-clip-text text-transparent">
              booking machine
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Join leading DJs and promoters using personal invites to fill their events.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button size="lg">Start your 7-day free trial</Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" size="lg">
                Book a call
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-subtle">7-day free trial · No credit card required</p>
        </div>
      </div>
    </section>
  );
}

export function ChevronHint({ open }: { open: boolean }) {
  return (
    <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
  );
}
