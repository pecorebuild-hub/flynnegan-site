import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { isAdminAuthenticated } from "@/lib/auth";
import { readContent, resetFromSeed } from "@/lib/content/store";
import { getSubscribersCount } from "@/lib/db/subscribers";

export const dynamic = "force-dynamic";

async function resetSeedAction() {
  "use server";
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  await resetFromSeed();
  redirect("/admin");
}

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const [content, subscribersCount] = await Promise.all([
    readContent(),
    getSubscribersCount(),
  ]);

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
        <p>
          Subscribers: <strong>{subscribersCount}</strong>{" "}
          <Link href="/admin/subscribers" style={{ marginLeft: "0.5rem", fontSize: "0.9rem", textDecoration: "underline" }}>
            (View list)
          </Link>
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
            <ConfirmSubmit
              className="admin-btn secondary"
              confirmMessage="This replaces ALL works/sections with seed.json. Continue?"
            >
              Reset from seed.json
            </ConfirmSubmit>
          </form>
        </p>
      </div>
    </>
  );
}
