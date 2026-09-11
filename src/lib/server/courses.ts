import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ALL_LESSONS } from "@/data/content";

export const getCourseProgress = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ lesson_id: string }>`
      select lesson_id from course_progress where user_id = ${context.userId}
    `;
    return rows.map((r) => r.lesson_id);
  });

export const toggleLesson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { lessonId: string; complete: boolean }) => input)
  .handler(async ({ context, data }) => {
    const known = ALL_LESSONS.some((l) => l.id === data.lessonId);
    if (!known) throw new Error("Unknown lesson");
    const sql = await getSql();
    if (data.complete) {
      await sql`
        insert into course_progress (user_id, lesson_id)
        values (${context.userId}, ${data.lessonId})
        on conflict (user_id, lesson_id) do nothing
      `;
    } else {
      await sql`
        delete from course_progress
        where user_id = ${context.userId} and lesson_id = ${data.lessonId}
      `;
    }
    const rows = await sql<{ lesson_id: string }>`
      select lesson_id from course_progress where user_id = ${context.userId}
    `;
    return rows.map((r) => r.lesson_id);
  });
