import { Link } from "@tanstack/react-router";
import { Image as ImageIcon, Phone, Play, Send, Smile, Video, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroWaves } from "./waves";

function TrustedPill({ className }: { className?: string }) {
  return (
    <div
      className={`items-center gap-2 rounded-full border border-fg/10 bg-surface/60 px-4 py-2 backdrop-blur-sm ${className ?? ""}`}
    >
      <Zap className="h-4 w-4 animate-pulse text-orange" style={{ animationDuration: "2s" }} />
      <span className="text-xs font-medium text-fg sm:text-sm">
        Trusted by 100+ nightlife professionals
      </span>
    </div>
  );
}

function Headline({ className }: { className?: string }) {
  return (
    <h1 className={`text-fg leading-[1.1] ${className ?? ""}`}>
      Fill Your Events.
      <br />
      <span className="bg-gradient-to-r from-brand to-teal bg-clip-text text-transparent">
        Automatically.
      </span>
    </h1>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden lg:min-h-[110vh]">
      <HeroWaves />
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 pt-24 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pt-32 lg:pb-32">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="order-1 space-y-4 text-left lg:hidden">
            <TrustedPill className="inline-flex" />
            <Headline />
          </div>
          <div className="order-3 space-y-6 text-left sm:space-y-8 lg:order-1">
            <TrustedPill className="hidden lg:inline-flex" />
            <Headline className="hidden lg:block" />
            <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:text-xl">
              Nitefill finds your crowd on Instagram and sends each one a personal
              invite. Plus a private community of DJs mastering the business of
              staying booked.
            </p>
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <a href="#demo">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  <Play className="h-4 w-4" />
                  See in Action
                </Button>
              </a>
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </div>
            <p className="text-xs text-subtle">No credit card required · Cancel anytime</p>
          </div>
          <div className="order-2 flex justify-center lg:justify-end">
            <HeroMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div
        className="absolute -bottom-8 left-1/2 h-32 w-[80%] -translate-x-1/2 rounded-full bg-teal opacity-10 blur-[80px]"
      />
      <div
        className="relative overflow-hidden rounded-[20px] border border-fg/12 backdrop-blur-xl"
        style={{
          transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)",
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.1), 0 24px 48px rgba(0,0,0,0.2), 0 48px 80px rgba(0,0,0,0.15)",
          background: "rgba(15, 36, 74, 0.8)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
          }}
        />
        <div className="flex items-center justify-between border-b border-fg/8 px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-fg"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <svg className="h-6 w-6 text-fg/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-fg">@prospect</div>
              <div className="flex items-center gap-1.5 text-xs text-fg/60">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span>Active now</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-teal" strokeWidth={1.5} />
            <Video className="h-5 w-5 text-teal" strokeWidth={1.5} />
          </div>
        </div>
        <div className="min-h-[280px] space-y-4 px-4 py-6">
          <div className="flex justify-end">
            <div className="relative max-w-[75%]">
              <div
                className="rounded-[18px] px-4 py-3 text-sm leading-relaxed text-fg"
                style={{
                  background: "linear-gradient(90deg, var(--color-brand), var(--color-teal))",
                  boxShadow: "0 0 20px rgba(0, 230, 255, 0.15)",
                }}
              >
                Hey, noticed you're often out in London. We're throwing a rooftop
                party this weekend. Would be good to have you down if you're free.
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-1.5 text-xs text-fg/50">
                <svg className="h-3.5 w-3.5 text-teal" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                  <path d="M10.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 6.646-6.647a.5.5 0 0 1 .708 0z" />
                </svg>
                <span>2m</span>
              </div>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[75%]">
              <div
                className="rounded-[18px] border border-fg/10 px-4 py-3 text-sm leading-relaxed text-fg/90"
                style={{ background: "rgba(19, 44, 87, 0.7)" }}
              >
                Yo this looks sick! Where's it at? I'm definitely down
              </div>
            </div>
          </div>
          <div className="flex justify-start">
            <div
              className="flex items-center gap-2 rounded-[18px] border border-fg/10 px-4 py-2.5"
              style={{ background: "rgba(19, 44, 87, 0.7)" }}
            >
              <div className="flex gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="px-3 pb-3">
          <div
            className="flex items-center gap-3 rounded-[26px] border border-fg/8 px-4 py-2.5"
            style={{ background: "rgba(19, 44, 87, 0.6)" }}
          >
            <ImageIcon className="h-5 w-5 shrink-0 text-teal" strokeWidth={1.5} />
            <Smile className="h-5 w-5 shrink-0 text-teal" strokeWidth={1.5} />
            <span className="flex-1 text-sm text-fg/40">Write a message…</span>
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal"
              aria-hidden
            >
              <Send className="h-4 w-4 fill-navy text-navy" strokeWidth={2} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
