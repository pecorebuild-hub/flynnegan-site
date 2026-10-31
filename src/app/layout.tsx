import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_FONT_VARIANT } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Flynn Egan. Male Erotic Art",
  description:
    "Erotic Male Fine Art, Gay Queer BDSM Gothic Dark Prints & Custom Artwork",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-font={DEFAULT_FONT_VARIANT}>
      <body>{children}</body>
    </html>
  );
}
