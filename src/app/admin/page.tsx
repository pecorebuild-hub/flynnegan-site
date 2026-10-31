import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { readContent, resetFromSeed } from "@/lib/content/store";

async function resetSeedAction() {
  "use server";
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await resetFromSeed();
  redirect("/admin");
}

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const content = await readContent();

  return (
    <>
      <h1>Dashboard</h1>
      <div className="admin-card">
        <p>
          Sections: <strong>{content.sections.length}</strong>
        </p>
        <p>
          Works: <strong>{content.works.length}</strong>
        </p>
        <p style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link className="admin-btn" href="/admin/works/new">
            Add work
          </Link>
          <Link className="admin-btn secondary" href="/admin/works/batch">
            Batch add
          </Link>
          <Link className="admin-btn secondary" href="/preview/fonts">
            Font previews
          </Link>
          <form action={resetSeedAction}>
            <button className="admin-btn secondary" type="submit">
              Reset from seed.json
            </button>
          </form>
        </p>
      </div>
    </>
  );
}
