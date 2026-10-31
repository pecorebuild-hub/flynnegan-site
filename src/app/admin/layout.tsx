import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { destroyAdminSession, isAdminAuthenticated } from "@/lib/auth";

async function logoutAction() {
  "use server";
  await destroyAdminSession();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isLogin =
    pathname.includes("/admin/login") ||
    // fallback: login page has no auth chrome via parallel check
    false;

  const authed = await isAdminAuthenticated();

  // Allow login page without chrome; other admin routes require auth.
  // We detect login by checking if children path via middleware cookie approach —
  // simplest: always show chrome when authed; login page is separate unstyled.
  if (!authed) {
    return <>{children}</>;
  }

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <header
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <strong>Flynn admin</strong>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/sections">Sections</Link>
        <Link href="/admin/works">Works</Link>
        <Link href="/admin/works/batch">Batch</Link>
        <Link href="/" target="_blank">
          View site
        </Link>
        <form action={logoutAction}>
          <button className="admin-btn secondary" type="submit">
            Log out
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
