"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteWorkImage } from "@/lib/types";

type Props = {
  images: SiteWorkImage[];
};

export function Gallery({ images }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(() => {
    setOpenIndex((current) => {
      if (current === null || images.length === 0) return current;
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);
  const showNext = useCallback(() => {
    setOpenIndex((current) => {
      if (current === null || images.length === 0) return current;
      return (current + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, close, showPrev, showNext]);

  if (!images.length) return null;

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div
        className={`gallery-grid${images.length === 1 ? " single" : ""}`}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="gallery-item"
            onClick={() => setOpenIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={image.caption || ""} loading="lazy" />
            {image.caption ? (
              <div className="gallery-caption">{image.caption}</div>
            ) : null}
          </button>
        ))}
      </div>

      {active ? (
        <div className="lightbox" role="dialog" aria-modal="true">
          <button
            type="button"
            className="lightbox-close"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                className="lightbox-nav lightbox-prev"
                onClick={showPrev}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                type="button"
                className="lightbox-nav lightbox-next"
                onClick={showNext}
                aria-label="Next"
              >
                ›
              </button>
            </>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active.url} alt={active.caption || ""} />
          {active.caption ? (
            <div className="lightbox-caption">{active.caption}</div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
