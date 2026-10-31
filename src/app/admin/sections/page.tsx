"use client";

import { FormEvent, useEffect, useState } from "react";

type Section = {
  id: number;
  slug: string;
  title: string;
  sortOrder: number;
  showInNav: boolean;
};

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/sections");
    if (!response.ok) {
      setError("Unauthorized or failed to load");
      return;
    }
    const data = await response.json();
    setSections(data.sections);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Failed");
      return;
    }
    setTitle("");
    await load();
  }

  async function onDelete(id: number) {
    if (!confirm("Delete section and its works?")) return;
    await fetch(`/api/admin/sections?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <>
      <h1>Sections</h1>
      <p style={{ color: "#555" }}>
        Sections appear in the left navigation (Prints, Metal Plaques, …).
      </p>
      {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}

      <form className="admin-form admin-card" onSubmit={onCreate}>
        <label>
          New section title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <button type="submit">Add section</button>
      </form>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr key={section.id}>
                <td>{section.title}</td>
                <td>{section.slug}</td>
                <td>{section.sortOrder}</td>
                <td>
                  <button
                    className="admin-btn secondary"
                    type="button"
                    onClick={() => onDelete(section.id)}
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
