"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Section = { id: number; title: string };
type ImageRow = { url: string; caption: string; sortOrder: number; id?: number };

type Props = {
  sections: Section[];
  initial?: {
    id?: number;
    sectionId: number;
    title: string;
    series: string;
    description: string;
    longDescription: string;
    edition: string;
    year: string;
    price: string;
    buyUrl: string;
    prodigiSku: string;
    altLabel: string;
    altDescription: string;
    altLongDescription: string;
    altEdition: string;
    altPrice: string;
    altBuyUrl: string;
    altProdigiSku: string;
    images: ImageRow[];
    altImages: ImageRow[];
  };
};

const empty = {
  sectionId: 0,
  title: "",
  series: "",
  description: "",
  longDescription: "",
  edition: "",
  year: "",
  price: "",
  buyUrl: "",
  prodigiSku: "",
  altLabel: "",
  altDescription: "",
  altLongDescription: "",
  altEdition: "",
  altPrice: "",
  altBuyUrl: "",
  altProdigiSku: "",
  images: [] as ImageRow[],
  altImages: [] as ImageRow[],
};

export function WorkForm({ sections, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...empty,
    sectionId: initial?.sectionId || sections[0]?.id || 0,
    ...initial,
    images: initial?.images || [],
    altImages: initial?.altImages || [],
  });
  const [error, setError] = useState("");
  const [prodigiInfo, setProdigiInfo] = useState("");
  const [altProdigiInfo, setAltProdigiInfo] = useState("");
  const [uploading, setUploading] = useState<"primary" | "alt" | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onUpload(
    fileList: FileList | null,
    target: "images" | "altImages",
  ) {
    if (!fileList?.length) return;
    setUploading(target === "images" ? "primary" : "alt");
    const nextImages = [...form[target]];
    for (const file of Array.from(fileList)) {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (response.ok) {
        nextImages.push({
          url: data.url,
          caption: "",
          sortOrder: nextImages.length,
        });
      }
    }
    update(target, nextImages);
    setUploading(null);
  }

  async function lookupProdigi(kind: "primary" | "alt") {
    const sku = kind === "primary" ? form.prodigiSku : form.altProdigiSku;
    const setInfo = kind === "primary" ? setProdigiInfo : setAltProdigiInfo;
    if (!sku.trim()) return;
    setInfo("Loading…");
    const response = await fetch(
      `/api/admin/prodigi/${encodeURIComponent(sku.trim())}`,
    );
    const data = await response.json();
    if (!response.ok) {
      setInfo(data.error || "Lookup failed");
      return;
    }
    const summary = data.summary;
    setInfo(summary?.summary || "No details");
    if (summary?.sizeLine) {
      const sizeLine = summary.sizeLine as string;
      const field = kind === "primary" ? "description" : "altDescription";
      setForm((prev) => {
        const current = prev[field] || "";
        if (current.includes(sizeLine)) return prev;
        const next = current.trim()
          ? `${current.trim()}\n${sizeLine}`
          : sizeLine;
        return { ...prev, [field]: next };
      });
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const payload = {
      id: initial?.id,
      sectionId: Number(form.sectionId),
      title: form.title,
      series: form.series || null,
      description: form.description || null,
      longDescription: form.longDescription || null,
      edition: form.edition || null,
      year: form.year || null,
      price: form.price || null,
      buyUrl: form.buyUrl || null,
      prodigiSku: form.prodigiSku || null,
      altLabel: form.altLabel || null,
      altDescription: form.altDescription || null,
      altLongDescription: form.altLongDescription || null,
      altEdition: form.altEdition || null,
      altPrice: form.altPrice || null,
      altBuyUrl: form.altBuyUrl || null,
      altProdigiSku: form.altProdigiSku || null,
      images: form.images.map((img, index) => ({
        ...img,
        id: img.id || index + 1,
        workId: initial?.id || 0,
        sortOrder: index,
      })),
      altImages: form.altImages.map((img, index) => ({
        ...img,
        id: img.id || 1000 + index + 1,
        workId: initial?.id || 0,
        sortOrder: index,
      })),
    };

    const response = await fetch("/api/admin/works", {
      method: initial?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Save failed");
      return;
    }
    router.push("/admin/works");
    router.refresh();
  }

  function renderImageList(target: "images" | "altImages") {
    const busy = uploading === (target === "images" ? "primary" : "alt");
    return (
      <div>
        <strong>{target === "images" ? "Photos" : "Alternate photos"}</strong>
        <label className={`admin-file${busy ? " is-busy" : ""}`}>
          <span className="admin-file-btn">
            {busy ? "Uploading…" : "Choose photos"}
          </span>
          <span className="admin-file-hint">PNG, JPG — multiple allowed</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onUpload(e.target.files, target)}
            disabled={Boolean(uploading)}
          />
        </label>
        {form[target].map((image, index) => (
          <div key={`${target}-${image.url}-${index}`} className="admin-image-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="admin-thumb"
              src={image.url}
              alt=""
              referrerPolicy="no-referrer"
            />
            <div className="admin-image-fields">
              <input
                placeholder="Image URL"
                value={image.url}
                onChange={(e) => {
                  const images = [...form[target]];
                  images[index] = { ...image, url: e.target.value };
                  update(target, images);
                }}
              />
              <input
                placeholder="Caption"
                value={image.caption}
                onChange={(e) => {
                  const images = [...form[target]];
                  images[index] = { ...image, caption: e.target.value };
                  update(target, images);
                }}
              />
            </div>
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() =>
                update(
                  target,
                  form[target].filter((_, i) => i !== index),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <form className="admin-form admin-card" onSubmit={onSubmit}>
      <label>
        Section
        <select
          value={form.sectionId}
          onChange={(e) => update("sectionId", Number(e.target.value))}
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Title
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </label>
      <label>
        Series
        <input
          value={form.series}
          onChange={(e) => update("series", e.target.value)}
        />
      </label>
      <label>
        Short description (size / medium — shown on section listing)
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </label>
      <label>
        Edition
        <input
          value={form.edition}
          onChange={(e) => update("edition", e.target.value)}
          placeholder="Ed. 10/10"
        />
      </label>
      <label>
        Year
        <input
          value={form.year}
          onChange={(e) => update("year", e.target.value)}
          placeholder="2026"
        />
      </label>
      <label>
        Long description (work page only)
        <textarea
          rows={8}
          value={form.longDescription}
          onChange={(e) => update("longDescription", e.target.value)}
        />
      </label>
      <label>
        Price (number, shown as $…)
        <input
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
        />
      </label>
      <label>
        Buy link (button URL)
        <input
          value={form.buyUrl}
          onChange={(e) => update("buyUrl", e.target.value)}
        />
      </label>
      <label>
        Prodigi SKU (size is in the SKU, e.g. MOU-DI-20X30 = 20×30)
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={form.prodigiSku}
            onChange={(e) => update("prodigiSku", e.target.value)}
            placeholder="MOU-DI-20X30 or GLOBAL-CAN-10X10"
          />
          <button
            className="admin-btn secondary"
            type="button"
            onClick={() => lookupProdigi("primary")}
          >
            Lookup
          </button>
        </div>
      </label>
      {prodigiInfo ? (
        <p style={{ color: "#555", whiteSpace: "pre-wrap" }}>{prodigiInfo}</p>
      ) : null}

      {renderImageList("images")}

      <hr className="admin-divider" />
      <h2 className="admin-subheading">Alternate format (optional)</h2>
      <p className="admin-help">
        Use this for a second product of the same work — e.g. print + canvas.
        Leave empty if not needed.
      </p>
      <label>
        Alternate label
        <input
          value={form.altLabel}
          onChange={(e) => update("altLabel", e.target.value)}
          placeholder="Canvas / Dibond / etc."
        />
      </label>
      <label>
        Alternate short description
        <textarea
          rows={3}
          value={form.altDescription}
          onChange={(e) => update("altDescription", e.target.value)}
        />
      </label>
      <label>
        Alternate edition
        <input
          value={form.altEdition}
          onChange={(e) => update("altEdition", e.target.value)}
          placeholder="Ed. 5/5"
        />
      </label>
      <label>
        Alternate long description
        <textarea
          rows={6}
          value={form.altLongDescription}
          onChange={(e) => update("altLongDescription", e.target.value)}
        />
      </label>
      <label>
        Alternate price
        <input
          value={form.altPrice}
          onChange={(e) => update("altPrice", e.target.value)}
        />
      </label>
      <label>
        Alternate buy link
        <input
          value={form.altBuyUrl}
          onChange={(e) => update("altBuyUrl", e.target.value)}
        />
      </label>
      <label>
        Alternate Prodigi SKU
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={form.altProdigiSku}
            onChange={(e) => update("altProdigiSku", e.target.value)}
            placeholder="Optional"
          />
          <button
            className="admin-btn secondary"
            type="button"
            onClick={() => lookupProdigi("alt")}
          >
            Lookup
          </button>
        </div>
      </label>
      {altProdigiInfo ? (
        <p style={{ color: "#555", whiteSpace: "pre-wrap" }}>{altProdigiInfo}</p>
      ) : null}

      {renderImageList("altImages")}

      {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}
      <button type="submit">{initial?.id ? "Save" : "Create"}</button>
    </form>
  );
}
