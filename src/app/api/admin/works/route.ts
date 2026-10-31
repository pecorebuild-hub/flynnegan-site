import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  createWork,
  createWorksBatch,
  deleteWork,
  readContent,
  updateWork,
} from "@/lib/content/store";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const content = await readContent();
  return NextResponse.json({
    works: content.works,
    sections: content.sections,
  });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();

  try {
    if (body.batch) {
      const created = await createWorksBatch(body.batch);
      return NextResponse.json({ works: created });
    }
    const work = await createWork(body);
    return NextResponse.json({ work });
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
    const work = await updateWork(Number(body.id), body);
    return NextResponse.json({ work });
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
  await deleteWork(id);
  return NextResponse.json({ ok: true });
}
