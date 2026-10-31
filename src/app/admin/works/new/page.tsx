import { redirect } from "next/navigation";
import { WorkForm } from "@/components/admin/WorkForm";
import { isAdminAuthenticated } from "@/lib/auth";
import { readContent } from "@/lib/content/store";

export default async function NewWorkPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const content = await readContent();

  return (
    <>
      <h1>New work</h1>
      <WorkForm sections={content.sections} />
    </>
  );
}
