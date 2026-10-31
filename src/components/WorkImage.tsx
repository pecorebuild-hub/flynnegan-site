import Image from "next/image";
import type { CSSProperties } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  quality?: number;
  /** Intrinsic ratio hint for layout; display size still comes from CSS/sizes. */
  width?: number;
  height?: number;
  style?: CSSProperties;
};

/**
 * Optimized artwork image via Next/Vercel Image Optimization
 * (AVIF/WebP + responsive srcset).
 */
export function WorkImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  quality = 75,
  width = 1600,
  height = 2000,
  style,
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      priority={priority}
      className={className}
      style={{ width: "100%", height: "auto", ...style }}
    />
  );
}
