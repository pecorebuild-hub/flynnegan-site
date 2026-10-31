"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  confirmMessage: string;
  className?: string;
};

/** Submit button that asks before posting a server-action form. */
export function ConfirmSubmit({ children, confirmMessage, className }: Props) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
