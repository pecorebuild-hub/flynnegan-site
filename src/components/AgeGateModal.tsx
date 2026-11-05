"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const VERIFIED_KEY = "age_verified_18";
const VERIFIED_UNTIL_KEY = "age_verified_until";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60;

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getVerificationSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  try {
    // 1. Check timestamp-based localStorage expiration (30 days)
    const untilStr = localStorage.getItem(VERIFIED_UNTIL_KEY);
    if (untilStr) {
      const until = Number(untilStr);
      if (Number.isFinite(until) && until > Date.now()) {
        return true;
      }
    }

    // 2. Check cookie fallback
    if (document.cookie.includes("age_verified_18=true")) {
      return true;
    }

    // 3. Fallback check for legacy boolean flag
    if (localStorage.getItem(VERIFIED_KEY) === "true") {
      return true;
    }
  } catch {
    // In case localStorage is blocked/restricted
  }
  return false;
}

function getServerSnapshot(): boolean {
  // During SSR, treat as verified to prevent hydration markup mismatch
  return true;
}

export default function AgeGateModal() {
  const isVerifiedInStorage = useSyncExternalStore(
    subscribeToStorage,
    getVerificationSnapshot,
    getServerSnapshot,
  );

  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const isAdminRoute =
    pathname?.startsWith("/admin") || pathname?.startsWith("/api");

  const isOpen = !isVerifiedInStorage && !dismissed && !isAdminRoute;

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Immediately focus the email input when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const markVerified = () => {
    const expiresAt = Date.now() + THIRTY_DAYS_MS;
    try {
      localStorage.setItem(VERIFIED_KEY, "true");
      localStorage.setItem(VERIFIED_UNTIL_KEY, String(expiresAt));
      document.cookie = `age_verified_18=true; max-age=${THIRTY_DAYS_SEC}; path=/; SameSite=Lax`;
    } catch {
      // Local storage may be disabled
    }
    setDismissed(true);
  };

  const handleJustEnter = () => {
    markVerified();
  };

  const handleEnterWithEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, source: "age_gate" }),
      });

      if (res.ok) {
        markVerified();
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMessage(data.error || "Unable to save email.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 text-white overflow-y-auto"
    >
      <div className="max-w-md w-full border border-neutral-800 bg-neutral-950 p-6 sm:p-8 flex flex-col gap-6 text-center my-auto shadow-2xl">
        {/* Brand & Disclaimer */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-300 font-medium">
            Flynn Egan
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-normal">
            Male Erotic Art
          </span>
          <h2 id="age-gate-title" className="sr-only">
            Age Verification
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed mt-3">
            This site contains adult erotic fine art, male nude studies, and mature themes intended for audiences 18 years of age or older. By entering, you confirm that you are at least 18 years of age.
          </p>
        </div>

        {/* Option 1 (First): Enter + Stay in Touch */}
        <form onSubmit={handleEnterWithEmail} className="flex flex-col gap-3">
          <p className="text-xs text-neutral-400 leading-normal">
            Stay updated on limited drops &amp; uncensored sketches:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={emailInputRef}
              autoFocus
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === "loading"}
              className="flex-1 bg-neutral-900/60 border border-neutral-800 px-3 py-2.5 text-sm text-center sm:text-left text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 transition"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="sm:flex-none bg-white text-black py-2.5 px-4 text-xs uppercase tracking-wider hover:bg-neutral-200 transition font-medium cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {status === "loading" ? "Entering..." : "Enter & Stay in touch"}
            </button>
          </div>
          {status === "error" && (
            <span className="text-xs text-red-400" role="alert">
              {errorMessage || "Something went wrong."} Try simple enter below.
            </span>
          )}
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-0.5">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-neutral-950 px-3 text-[10px] uppercase tracking-widest text-neutral-500 absolute">
            Or Just Enter
          </span>
        </div>

        {/* Option 2 (Second): Just Enter 18+ */}
        <button
          type="button"
          onClick={handleJustEnter}
          className="w-full border border-neutral-700 py-3 px-4 text-xs sm:text-sm uppercase tracking-widest text-neutral-200 hover:bg-neutral-800 hover:text-white transition cursor-pointer font-medium"
        >
          Enter Site / I am 18+
        </button>
      </div>
    </div>
  );
}
