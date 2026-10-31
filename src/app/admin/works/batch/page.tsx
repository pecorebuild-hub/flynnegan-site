"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Section = { id: number; title: string };
type Row = { title: string; price: string; buyUrl: string };

export default function BatchWorksPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState<number>(0);
  const [series, setSeries] = useState("");
  const [description, setDescription] = useState("");
  const [prodigiSku, setProdigiSku] = useState("");
  const [rows, setRows] = useState<Row[]>([
    { title: "", price: "", buyUrl: "" },
    { title: "", price: "", buyUrl: "" },
  ]);
  const [sharedUrls, setSharedUrls] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin/works")
      .then((r) => r.json())
      .then((data) => {
        setSections(data.sections || []);
        if (data.sections?.[0]) setSectionId(data.sections[0].id);
      });
  }, []);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/works", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch: {
          sectionId,
          series: series || null,
          description: description || null,
          prodigiSku: prodigiSku || null,
          sharedImages: sharedUrls
            .split("\n")
            .map((url) => url.trim())
            .filter(Boolean)
            .map((url) => ({ url })),
          rows: rows.filter((row) => row.title.trim()),
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Batch failed");
      return;
    }
    router.push("/admin/works");
    router.refresh();
  }

  return (
    <>
      <h1>Batch add works</h1>
      <p style={{ color: "#555", maxWidth: 640 }}>
        Shared fields (series, description, optional shared image URLs, Prodigi
        SKU) apply to every row. Per row: title, price, buy link — for series
        where only those change.
      </p>

      <form className="admin-form admin-card" onSubmit={onSubmit}>
        <label>
          Section
          <select
            value={sectionId}
            onChange={(e) => setSectionId(Number(e.target.value))}
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Series (shared)
          <input value={series} onChange={(e) => setSeries(e.target.value)} />
        </label>
        <label>
          Description (shared)
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Prodigi SKU (shared, optional)
          <input
            value={prodigiSku}
            onChange={(e) => setProdigiSku(e.target.value)}
          />
        </label>
        <label>
          Shared image URLs (one per line, optional)
          <textarea
            rows={3}
            value={sharedUrls}
            onChange={(e) => setSharedUrls(e.target.value)}
            placeholder="https://…"
          />
        </label>

        <div>
          <strong>Rows</strong>
          {rows.map((row, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 0.5fr 1.4fr auto",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <input
                placeholder="Title"
                value={row.title}
                onChange={(e) => updateRow(index, { title: e.target.value })}
              />
              <input
                placeholder="Price"
                value={row.price}
                onChange={(e) => updateRow(index, { price: e.target.value })}
              />
              <input
                placeholder="Buy URL"
                value={row.buyUrl}
                onChange={(e) => updateRow(index, { buyUrl: e.target.value })}
              />
              <button
                type="button"
                className="admin-btn secondary"
                onClick={() =>
                  setRows((prev) => prev.filter((_, i) => i !== index))
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn secondary"
            style={{ marginTop: "0.75rem" }}
            onClick={() =>
              setRows((prev) => [...prev, { title: "", price: "", buyUrl: "" }])
            }
          >
            Add row
          </button>
        </div>

        {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}
        <button type="submit">Create works</button>
      </form>
    </>
  );
}
