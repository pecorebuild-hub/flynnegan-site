import type { MetadataRoute } from "next";
import { getNavSections, readContent } from "@/lib/content/store";
import { SITE_URL } from "@/lib/seo";

/** Blob-backed catalogue — must not be statically prerendered at build. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [content, sections] = await Promise.all([
    readContent(),
    getNavSections(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/information",
    "/contact",
    "/commissions",
  ].map((path) => ({
    url: `${SITE_URL}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const sectionRoutes: MetadataRoute.Sitemap = sections.map((section) => ({
    url: `${SITE_URL}/${section.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const workRoutes: MetadataRoute.Sitemap = content.works
    .filter((work) => work.published)
    .map((work) => ({
      url: `${SITE_URL}/${work.sectionSlug}/${work.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    }));

  return [...staticRoutes, ...sectionRoutes, ...workRoutes];
}
