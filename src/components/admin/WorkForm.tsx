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
    price: string;
    buyUrl: string;
    prodigiSku: string;
    images: ImageRow[];
  };
};

const empty = {
  sectionId: 0,
  title: "",
  series: "",
  description: "",
  longDescription: "",
  edition: "",
  price: "",
  buyUrl: "",
  prodigiSku: "",
  images: [] as ImageRow[],
};

export function WorkForm({ sections, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...empty,
    sectionId: initial?.sectionId || sections[0]?.id || 0,
    ...initial,
    images: initial?.images || [],
  });
  const [error, setError] = useState("");
  const [prodigiInfo, setProdigiInfo] = useState("");
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onUpload(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    const nextImages = [...form.images];
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
    update("images", nextImages);
    setUploading(false);
  }

  async function lookupProdigi() {
    if (!form.prodigiSku.trim()) return;
    setProdigiInfo("Loading…");
    const response = await fetch(
      `/api/admin/prodigi/${encodeURIComponent(form.prodigiSku.trim())}`,
    );
    const data = await response.json();
    if (!response.ok) {
      setProdigiInfo(data.error || "Lookup failed");
      return;
    }
    const summary = data.summary;
    setProdigiInfo(summary?.summary || "No details");
    if (summary?.sizeLine) {
      const sizeLine = summary.sizeLine as string;
      setForm((prev) => {
        const current = prev.description || "";
        if (current.includes(sizeLine)) return prev;
        const next = current.trim()
          ? `${current.trim()}\n${sizeLine}`
          : sizeLine;
        return { ...prev, description: next };
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
      price: form.price || null,
      buyUrl: form.buyUrl || null,
      prodigiSku: form.prodigiSku || null,
      images: form.images.map((img, index) => ({
        ...img,
        id: img.id || index + 1,
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
            onClick={lookupProdigi}
          >
            Lookup
          </button>
        </div>
      </label>
      {prodigiInfo ? (
        <p style={{ color: "#555", whiteSpace: "pre-wrap" }}>{prodigiInfo}</p>
      ) : null}

      <div>
        <strong>Photos</strong>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onUpload(e.target.files)}
          disabled={uploading}
        />
        {form.images.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            style={{
              display: "grid",
              gridTemplateColumns: "96px 1fr auto",
              gap: "0.75rem",
              marginTop: "0.75rem",
              alignItems: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt=""
              style={{ width: 96, height: 96, objectFit: "cover" }}
            />
            <input
              placeholder="Caption"
              value={image.caption}
              onChange={(e) => {
                const images = [...form.images];
                images[index] = { ...image, caption: e.target.value };
                update("images", images);
              }}
            />
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() =>
                update(
                  "images",
                  form.images.filter((_, i) => i !== index),
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}
      <button type="submit">{initial?.id ? "Save" : "Create"}</button>
    </form>
  );
}
