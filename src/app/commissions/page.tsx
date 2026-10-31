import { SiteShell } from "@/components/SiteShell";
import { getNavSections, getSiteMeta } from "@/lib/content/store";

export default async function CommissionsPage() {
  const [sections, site] = await Promise.all([getNavSections(), getSiteMeta()]);

  return (
    <SiteShell
      sections={sections}
      activeSection="commissions"
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <article style={{ maxWidth: "40rem" }}>
        <h1 className="work-title" style={{ marginBottom: "1.5rem" }}>
          Commissions
        </h1>
        <div className="work-meta">
          Private commissions and custom artwork bookings.
          {"\n\n"}
          <strong>100% Upfront Payment:</strong> All custom artwork bookings and
          private commissions require full upfront payment via Throne prior to
          the start of production.
          {"\n\n"}
          Contact via the form for availability, scope, and references.
        </div>
      </article>
    </SiteShell>
  );
}
