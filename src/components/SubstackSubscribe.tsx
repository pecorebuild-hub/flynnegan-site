"use client";

import { useState } from "react";

const ACTION = "https://flynnegan.substack.com/api/v1/free?nojs=true";

/**
 * Real Substack signup via browser form POST (same as their embed).
 * `fetch` + no-cors was a fake success — Cloudflare/API rejected those calls.
 * Posts into a hidden iframe so the reader stays on-site.
 */
export function SubstackSubscribe() {
  const [done, setDone] = useState(false);

  return (
    <div className="nav-substack">
      <form
        className="nav-substack-form"
        action={ACTION}
        method="post"
        target="substack-subscribe-frame"
        style={done ? { display: "none" } : undefined}
        onSubmit={() => {
          window.setTimeout(() => setDone(true), 500);
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
          Access Granted. Check your inbox for the Private Vault link!
        </p>
      ) : null}

      <iframe
        className="nav-substack-frame"
        name="substack-subscribe-frame"
        title="Substack subscribe"
        tabIndex={-1}
      />
    </div>
  );
}
