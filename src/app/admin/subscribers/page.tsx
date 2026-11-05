import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSubscribers } from "@/lib/db/subscribers";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const list = await getSubscribers();

  const allEmails = list.map((s) => s.email).join("\n");

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Subscribers ({list.length})</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#888", fontSize: "0.9rem" }}>
            Collected via the age gate modal and sidebar subscription form into Neon Postgres.
          </p>
        </div>
        <Link className="admin-btn secondary" href="/admin">
          &larr; Back to Dashboard
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="admin-card">
          <p style={{ margin: 0, color: "#888" }}>No subscribers yet.</p>
        </div>
      ) : (
        <>
          <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem" }}>Quick Copy</h2>
            <p style={{ margin: "0 0 0.5rem", color: "#888", fontSize: "0.85rem" }}>
              All emails separated by newlines (ready to paste into newsletter services):
            </p>
            <textarea
              readOnly
              rows={Math.min(8, Math.max(3, list.length))}
              style={{
                width: "100%",
                background: "#111",
                color: "#ddd",
                border: "1px solid #333",
                padding: "0.5rem",
                fontSize: "0.85rem",
                fontFamily: "monospace",
              }}
              value={allEmails}
            />
          </div>

          <div className="admin-card">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #333", color: "#aaa", fontSize: "0.85rem" }}>
                  <th style={{ padding: "0.5rem" }}>#</th>
                  <th style={{ padding: "0.5rem" }}>Email</th>
                  <th style={{ padding: "0.5rem" }}>Source</th>
                  <th style={{ padding: "0.5rem" }}>Joined At</th>
                </tr>
              </thead>
              <tbody>
                {list.map((sub, index) => (
                  <tr
                    key={sub.id}
                    style={{
                      borderBottom: "1px solid #222",
                      fontSize: "0.9rem",
                    }}
                  >
                    <td style={{ padding: "0.5rem", color: "#666" }}>{index + 1}</td>
                    <td style={{ padding: "0.5rem", fontWeight: 500 }}>{sub.email}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.15rem 0.45rem",
                          fontSize: "0.75rem",
                          borderRadius: "3px",
                          background: sub.source === "age_gate" ? "#2e2315" : "#1e2a38",
                          color: sub.source === "age_gate" ? "#fcd34d" : "#93c5fd",
                        }}
                      >
                        {sub.source}
                      </span>
                    </td>
                    <td style={{ padding: "0.5rem", color: "#888", fontSize: "0.85rem" }}>
                      {new Date(sub.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

