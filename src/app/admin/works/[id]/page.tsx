import { notFound, redirect } from "next/navigation";
import { WorkForm } from "@/components/admin/WorkForm";
import { isAdminAuthenticated } from "@/lib/auth";
import { readContent } from "@/lib/content/store";

type Props = { params: Promise<{ id: string }> };

export default async function EditWorkPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const { id } = await params;
  const content = await readContent();
  const work = content.works.find((item) => item.id === Number(id));
  if (!work) notFound();

  return (
    <>
      <h1>Edit work</h1>
      <WorkForm
        sections={content.sections}
        initial={{
          id: work.id,
          sectionId: work.sectionId,
          title: work.title,
          series: work.series || "",
          description: work.description || "",
          longDescription: work.longDescription || "",
          edition: work.edition || "",
          price: work.price || "",
          buyUrl: work.buyUrl || "",
          prodigiSku: work.prodigiSku || "",
          images: work.images.map((img) => ({
            id: img.id,
            url: img.url,
            caption: img.caption || "",
            sortOrder: img.sortOrder,
          })),
        }}
      />
    </>
  );
}
