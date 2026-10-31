type ProdigiDimensions = {
  width?: number;
  height?: number;
  units?: string;
};

type ProdigiProduct = {
  sku?: string;
  description?: string;
  productDimensions?: ProdigiDimensions;
  attributes?: Record<string, unknown>;
};

function formatInches(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function inchesToCm(value: number) {
  return Math.round(value * 2.54 * 10) / 10;
}

/** Pull size from SKU patterns like MOU-DI-20X30 or GLOBAL-CAN-10X10 */
export function sizeFromSku(sku: string): string | null {
  const match = sku.toUpperCase().match(/(\d+)\s*X\s*(\d+)/i);
  if (!match) return null;
  return `${match[1]} × ${match[2]}`;
}

export function formatProductSize(product: ProdigiProduct): string | null {
  const dims = product.productDimensions;
  if (dims?.width != null && dims?.height != null) {
    const units = (dims.units || "in").toLowerCase();
    if (units === "in" || units === "inch" || units === "inches") {
      const wCm = inchesToCm(dims.width);
      const hCm = inchesToCm(dims.height);
      return `${formatInches(dims.width)} × ${formatInches(dims.height)} in (${wCm} × ${hCm} cm)`;
    }
    if (units === "mm") {
      return `${dims.width} × ${dims.height} mm (${Math.round(dims.width / 10)} × ${Math.round(dims.height / 10)} cm)`;
    }
    return `${dims.width} × ${dims.height} ${dims.units || ""}`.trim();
  }

  if (product.sku) {
    const fromSku = sizeFromSku(product.sku);
    if (fromSku) return `${fromSku} (from SKU)`;
  }

  // Sometimes size only lives in the prose description, e.g. "25x25cm"
  const fromDescription = product.description?.match(
    /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(cm|mm|in|")/i,
  );
  if (fromDescription) {
    return `${fromDescription[1]} × ${fromDescription[2]} ${fromDescription[3]}`;
  }

  return null;
}

export function summarizeProdigiProduct(product: ProdigiProduct) {
  const size = formatProductSize(product);
  const description = product.description || "No description";
  const sku = product.sku || "";
  const attrs = product.attributes
    ? Object.entries(product.attributes)
        .map(([key, value]) => {
          const rendered = Array.isArray(value) ? value.join(", ") : String(value);
          return `${key}: ${rendered}`;
        })
        .join(" · ")
    : "";

  return {
    sku,
    description,
    size,
    attributes: attrs,
    summary: [description, size ? `Size: ${size}` : null, attrs || null]
      .filter(Boolean)
      .join(" · "),
    /** Suggested line to merge into a work description */
    sizeLine: size
      ? size.includes("cm")
        ? size.replace(/\s*\(.*\)/, "")
        : size
      : null,
  };
}
