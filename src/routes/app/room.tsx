import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { COURSE_MODULES } from "@/data/content";
import { getCourseProgress, toggleLesson } from "@/lib/server/courses";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/room")({
  component: RoomPage,
  head: () => ({ meta: [{ title: "The Room – Nitefill" }] }),
});

function RoomPage() {
  const [done, setDone] = useState<string[]>([]);
  const [open, setOpen] = useState<string>(COURSE_MODULES[0]!.id);

  useEffect(() => {
    void getCourseProgress().then(setDone);
  }, []);

  const total = COURSE_MODULES.reduce((n, m) => n + m.lessons.length, 0);
  const pct = total ? Math.round((done.length / total) * 100) : 0;

  async function flip(id: string, complete: boolean) {
    const next = await toggleLesson({ data: { lessonId: id, complete } });
    setDone(next);
  }

  const doneSet = useMemo(() => new Set(done), [done]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-teal">The Nitefill Room</p>
        <h1 className="mt-1 text-3xl">The business of getting booked</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {total} lessons across {COURSE_MODULES.length} modules. Identity, proof,
          outreach, negotiation, residencies, festivals. Not mixing.
        </p>
      </div>
      <div className="rounded-2xl border border-fg/8 bg-surface p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted">Progress</span>
          <span className="tabular-nums text-teal">
            {done.length}/{total} · {pct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-panel">
          <div className="h-full bg-teal" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="space-y-3">
        {COURSE_MODULES.map((mod) => {
          const finished = mod.lessons.filter((l) => doneSet.has(l.id)).length;
          const expanded = open === mod.id;
          return (
            <section key={mod.id} className="overflow-hidden rounded-2xl border border-fg/8 bg-surface">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 p-5 text-left"
                onClick={() => setOpen(expanded ? "" : mod.id)}
                aria-expanded={expanded}
              >
                <div>
                  <p className="text-xs text-orange">Module {String(mod.number).padStart(2, "0")}</p>
                  <h2 className="mt-1 text-lg">{mod.title}</h2>
                  <p className="mt-1 text-sm text-muted">{mod.blurb}</p>
                </div>
                <Badge>
                  {finished}/{mod.lessons.length}
                </Badge>
              </button>
              {expanded && (
                <ul className="border-t border-fg/8">
                  {mod.lessons.map((lesson) => {
                    const on = doneSet.has(lesson.id);
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-start gap-3 px-5 py-4 border-t border-fg/5 first:border-t-0"
                      >
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => flip(lesson.id, !on)}
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                            on ? "border-teal bg-teal text-navy" : "border-fg/30",
                          )}
                        >
                          {on ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                        </button>
                        <div>
                          <p className="text-sm font-medium text-fg">{lesson.title}</p>
                          <p className="mt-1 text-sm text-muted">{lesson.summary}</p>
                          <p className="mt-1 text-xs text-subtle">{lesson.minutes} min</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
