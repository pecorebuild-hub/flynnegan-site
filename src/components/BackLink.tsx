"use client";

import { useRouter } from "next/navigation";

type Props = {
  href: string;
};

export function BackLink({ href }: Props) {
  const router = useRouter();

  return (
    <a
      href={href}
      className="back-link"
      onClick={(event) => {
        event.preventDefault();
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        router.push(href);
      }}
    >
      ← Back
    </a>
  );
}
