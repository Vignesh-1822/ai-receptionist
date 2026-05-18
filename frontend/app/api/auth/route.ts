import { NextRequest, NextResponse } from "next/server";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface Record { attempts: number; lockedUntil: number | null }
const attempts = new Map<string, Record>();

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const now = Date.now();
  const record = attempts.get(ip) ?? { attempts: 0, lockedUntil: null };

  if (record.lockedUntil && now < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const { password } = await req.json();

  if (password !== process.env.SITE_PASSWORD) {
    const newAttempts = record.attempts + 1;
    attempts.set(ip, {
      attempts: newAttempts,
      lockedUntil: newAttempts >= MAX_ATTEMPTS ? now + LOCKOUT_MS : null,
    });
    const remaining = MAX_ATTEMPTS - newAttempts;
    return NextResponse.json(
      { error: remaining > 0 ? `Incorrect password. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` : `Too many attempts. Try again in 15 minutes.` },
      { status: remaining > 0 ? 401 : 429 }
    );
  }

  attempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("aria_auth", process.env.SITE_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
