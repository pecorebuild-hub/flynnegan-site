"use client";

import { FormEvent, useState } from "react";

const SUBSTACK_URL = "https://flynnegan.substack.com/api/v1/free";

/**
 * Substack free-subscribe form (Collector's Vault copy).
 * Keeps existing nav styles; posts with no-cors like Substack embeds allow.
 */
export function SubstackSubscribe() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email !== "string" || !email.trim()) return;

    setStatus("loading");
    try {
      await fetch(SUBSTACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        mode: "no-cors",
        body: new URLSearchParams({ email: email.trim() }),
      });
      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="nav-substack">
        <p className="nav-substack-done">
          Access Granted. Check your inbox for the Private Vault link!
        </p>
      </div>
    );
  }

  return (
    <div className="nav-substack">
      <form className="nav-substack-form" onSubmit={onSubmit}>
        <label className="nav-substack-label" htmlFor="substack-email">
          Stay In Touch
        </label>
        <div className="nav-substack-row">
          <input
            id="substack-email"
            className="nav-substack-input"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Enter your email for Collector's Vault"
            disabled={status === "loading"}
          />
          <button
            className="nav-substack-btn"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Connecting…" : "Subscribe"}
          </button>
        </div>
        {status === "error" ? (
          <p className="nav-substack-legal">
            Something went wrong. Please try again.
          </p>
        ) : (
          <p className="nav-substack-legal">
            By subscribing you agree to Substack&apos;s{" "}
            <a href="https://substack.com/tos" target="_blank" rel="noreferrer">
              Terms
            </a>
            ,{" "}
            <a
              href="https://substack.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
            .
          </p>
        )}
      </form>
    </div>
  );
}
