"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Work = {
  id: number;
  title: string;
  sectionTitle: string;
  price: string | null;
  slug: string;
};

export default function AdminWorksPage() {
  const [works, setWorks] = useState<Work[]>([]);

  async function load() {
    const response = await fetch("/api/admin/works");
    if (!response.ok) return;
    const data = await response.json();
    setWorks(data.works);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onDelete(id: number) {
    if (!confirm("Delete this work?")) return;
    await fetch(`/api/admin/works?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <h1>Works</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link className="admin-btn" href="/admin/works/new">
            Add
          </Link>
          <Link className="admin-btn secondary" href="/admin/works/batch">
            Batch
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Section</th>
              <th>Price</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {works.map((work) => (
              <tr key={work.id}>
                <td>{work.title}</td>
                <td>{work.sectionTitle}</td>
                <td>{work.price ? `$${work.price}` : "—"}</td>
                <td style={{ display: "flex", gap: "0.4rem" }}>
                  <Link
                    className="admin-btn secondary"
                    href={`/admin/works/${work.id}`}
                  >
                    Edit
                  </Link>
                  <button
                    className="admin-btn secondary"
                    type="button"
                    onClick={() => onDelete(work.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
