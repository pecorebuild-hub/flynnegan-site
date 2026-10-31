"use client";

import { useEffect } from "react";
import type { FontVariantId } from "@/lib/fonts";

export function FontAttr({ variant }: { variant: FontVariantId }) {
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.getAttribute("data-font");
    html.setAttribute("data-font", variant);
    return () => {
      if (previous) html.setAttribute("data-font", previous);
      else html.removeAttribute("data-font");
    };
  }, [variant]);

  return null;
}
