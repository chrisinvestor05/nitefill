import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { newId } from "./ids";

export const submitContact = createServerFn({ method: "POST" })
  .validator(
    (input: { name: string; email: string; topic?: string; message: string }) => {
      const name = input.name.trim();
      const email = input.email.trim();
      const message = input.message.trim();
      if (name.length < 2) throw new Error("Please enter your name.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
      if (message.length < 10) throw new Error("Message must be at least 10 characters.");
      return {
        name,
        email,
        topic: input.topic?.trim() || "general",
        message,
      };
    },
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = newId("msg");
    await sql`
      insert into contact_messages (id, name, email, topic, message)
      values (${id}, ${data.name}, ${data.email}, ${data.topic}, ${data.message})
    `;
    return { ok: true as const };
  });

export const joinRoomWaitlist = createServerFn({ method: "POST" })
  .validator((input: { email: string; instagram?: string }) => {
    const email = input.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
    return {
      email,
      instagram: (input.instagram ?? "").replace(/^@+/, "").trim(),
    };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = newId("room");
    await sql`
      insert into room_waitlist (id, email, instagram)
      values (${id}, ${data.email}, ${data.instagram || null})
    `;
    return { ok: true as const };
  });
