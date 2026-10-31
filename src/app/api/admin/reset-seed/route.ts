import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { resetFromSeed } from "@/lib/content/store";

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const content = await resetFromSeed();
  return NextResponse.json({
    ok: true,
    sections: content.sections.length,
    works: content.works.length,
  });
}
