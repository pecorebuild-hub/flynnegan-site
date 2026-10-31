import { put } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/admin-guard";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

/** Client uploads send JSON (token / webhook). Local fallback uses multipart. */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  // Local / small-file server upload (FormData) — avoid on Vercel for large files
  if (contentType.includes("multipart/form-data")) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `uploads/${Date.now()}-${safeName}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Prefer streaming File directly (still subject to function body limits)
      const blob = await put(filename, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type || undefined,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return NextResponse.json({ url: blob.url });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const localName = `${Date.now()}-${safeName}`;
    await fs.writeFile(path.join(uploadsDir, localName), bytes);
    return NextResponse.json({ url: `/uploads/${localName}` });
  }

  // Direct-to-Blob client upload (token exchange + completion webhook)
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured" },
      { status: 500 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await isAdminAuthenticated())) {
          throw new Error("Not authenticated");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/avif",
            "image/heic",
            "image/heif",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async () => {
        // Client already receives the blob URL; nothing to persist here.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
