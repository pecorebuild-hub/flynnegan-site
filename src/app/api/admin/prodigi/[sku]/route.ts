import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { summarizeProdigiProduct } from "@/lib/prodigi";

type Props = {
  params: Promise<{ sku: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { sku } = await params;
  const apiKey = process.env.PRODIGI_API_KEY || process.env["X-API-Key"];
  if (!apiKey) {
    return NextResponse.json(
      { error: "PRODIGI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const base =
    process.env.PRODIGI_API_BASE || "https://api.prodigi.com/v4.0";
  const response = await fetch(`${base}/products/${encodeURIComponent(sku)}`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const summary = summarizeProdigiProduct(data.product || {});
  return NextResponse.json({ ...data, summary });
}
