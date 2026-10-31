import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  createSection,
  deleteSection,
  readContent,
  updateSection,
} from "@/lib/content/store";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const content = await readContent();
  return NextResponse.json({ sections: content.sections });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();
  try {
    const section = await createSection(body);
    return NextResponse.json({ section });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();
  try {
    const section = await updateSection(Number(body.id), body);
    return NextResponse.json({ section });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  await deleteSection(id);
  return NextResponse.json({ ok: true });
}
