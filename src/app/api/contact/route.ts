import { NextResponse } from "next/server";
import { saveContactMessage } from "@/lib/server/contact";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { name?: string; email?: string; message?: string } | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const message = body.message?.trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const result = await saveContactMessage({ name, email, message });
    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    console.error("[api/contact] failed to process contact form submission:", error);
    return NextResponse.json(
      { error: "Could not save your message right now. Please try again or email directly." },
      { status: 500 }
    );
  }
}

