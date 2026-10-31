export const FONT_VARIANTS = {
  bricolage: {
    id: "bricolage",
    label: "Bricolage Grotesque",
    display: "Bricolage Grotesque",
    body: "Bricolage Grotesque",
  },
  geist: {
    id: "geist",
    label: "Geist",
    display: "Geist",
    body: "Geist",
  },
  "geist-mono": {
    id: "geist-mono",
    label: "Geist + Mono",
    display: "Geist",
    body: "Geist Mono",
  },
  fell: {
    id: "fell",
    label: "IM Fell English",
    display: "IM Fell English",
    body: "Geist",
  },
} as const;

export type FontVariantId = keyof typeof FONT_VARIANTS;

export const DEFAULT_FONT_VARIANT: FontVariantId = "geist";

export function isFontVariantId(value: string): value is FontVariantId {
  return value in FONT_VARIANTS;
}
