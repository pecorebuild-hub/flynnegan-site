"use client";

import { useState } from "react";

const ACTION = "https://flynnegan.substack.com/api/v1/free?nojs=true";

/**
 * Substack signup via a real browser form POST.
 * Hidden iframes are blocked by Substack CSP (frame-ancestors), so the
 * confirmation/welcome page must open in a new tab for the subscribe to stick.
 */
export function SubstackSubscribe() {
  const [done, setDone] = useState(false);

  return (
    <div className="nav-substack">
      <form
        className="nav-substack-form"
        action={ACTION}
        method="post"
        target="_blank"
        rel="noopener noreferrer"
        style={done ? { display: "none" } : undefined}
        onSubmit={() => {
          window.setTimeout(() => setDone(true), 300);
        }}
      >
        <input type="hidden" name="source" value="embed" />
        <input
          type="hidden"
          name="current_url"
          value="https://gayart.studio/"
        />
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
            placeholder="Enter your email"
          />
          <button className="nav-substack-btn" type="submit">
            Subscribe
          </button>
        </div>
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
      </form>

      {done ? (
        <p className="nav-substack-done">
          Almost there — finish in the Substack tab that just opened, then check
          your inbox (and spam).
        </p>
      ) : null}
    </div>
  );
}
