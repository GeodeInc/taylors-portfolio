import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getCount, increment, DAILY_LIMIT } from "@/lib/contact-counter";
import { checkRateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  return NextResponse.json({ count: getCount(), limit: DAILY_LIMIT });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests — try again in an hour." }, { status: 429 });
    }

    if (getCount() >= DAILY_LIMIT) {
      return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
    }

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "taylor@tenzorllc.com",
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });

    const count = increment();
    return NextResponse.json({ ok: true, count, limit: DAILY_LIMIT });
  } catch {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
