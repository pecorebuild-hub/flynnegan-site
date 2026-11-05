import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/db/subscribers";

export async function POST(request: Request) {
  try {
    let body: { email?: string; source?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Body may not be JSON
    }

    const email = body.email;
    const source = body.source || "site";

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const result = await addSubscriber(trimmed, source);

    return NextResponse.json({
      ok: true,
      message: result.alreadySubscribed
        ? "You're already on our list!"
        : "Thank you for subscribing!",
      alreadySubscribed: result.alreadySubscribed,
    });
  } catch (error) {
    console.error("Failed to subscribe email:", error);
    return NextResponse.json(
      { error: "Unable to subscribe at this moment. Please try again later." },
      { status: 500 },
    );
  }
}

