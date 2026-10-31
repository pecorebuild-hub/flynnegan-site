"use client";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function parseJsonSafe(response: Response): Promise<{
  url?: string;
  error?: string;
}> {
  const text = await response.text();
  try {
    return JSON.parse(text) as { url?: string; error?: string };
  } catch {
    return {
      error:
        text.slice(0, 160) ||
        `Upload failed (${response.status} ${response.statusText})`,
    };
  }
}

/**
 * Prefer direct-to-Blob client upload (no Vercel Function body limit / 413).
 * Falls back to FormData server upload for local/dev without Blob token.
 */
export async function uploadAdminImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const pathname = `uploads/${Date.now()}-${safeName(file.name)}`;
  onProgress?.(1);

  try {
    const { upload } = await import("@vercel/blob/client");
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
      multipart: file.size > 4 * 1024 * 1024,
      contentType: file.type || undefined,
      onUploadProgress: ({ percentage }) => {
        onProgress?.(Math.max(1, Math.round(percentage)));
      },
    });
    onProgress?.(100);
    return blob.url;
  } catch (clientError) {
    const message =
      clientError instanceof Error ? clientError.message : String(clientError);
    if (/not authenticated|unauthorized/i.test(message)) {
      throw new Error("Session expired — log in again");
    }

    // Only fall back for local/dev without Blob — not after a real client failure
    const allowFormFallback =
      /BLOB_READ_WRITE_TOKEN|not configured/i.test(message) ||
      (typeof window !== "undefined" &&
        /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname));

    if (!allowFormFallback) {
      throw new Error(message || "Upload failed");
    }

    onProgress?.(15);
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body,
    });
    const data = await parseJsonSafe(response);
    if (!response.ok || !data.url) {
      throw new Error(
        data.error ||
          (response.status === 413
            ? "File too large for server upload — configure Blob client upload"
            : `Upload failed (${response.status})`),
      );
    }
    onProgress?.(100);
    return data.url;
  }
}
