"use client";

import { useState } from "react";

export function SubstackSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "sidebar" }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="nav-substack">
      <label className="nav-substack-label" htmlFor="sidebar-email">
        Stay In Touch
      </label>

      {status === "success" ? (
        <div className="nav-substack-done" role="status">
          <p style={{ margin: 0 }}>{message}</p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setMessage("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              fontSize: "0.8rem",
              textDecoration: "underline",
              padding: 0,
              marginTop: "0.5rem",
              cursor: "pointer",
            }}
          >
            Subscribe another email
          </button>
        </div>
      ) : (
        <form className="nav-substack-form" onSubmit={handleSubmit}>
          <div className="nav-substack-row">
            <input
              id="sidebar-email"
              className="nav-substack-input"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
            />
            <button
              className="nav-substack-btn"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </div>
          {status === "error" && message ? (
            <p
              role="alert"
              style={{
                margin: "0.25rem 0 0",
                color: "#f87171",
                fontSize: "0.8rem",
                lineHeight: 1.3,
              }}
            >
              {message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}

export const NewsletterSubscribe = SubstackSubscribe;
