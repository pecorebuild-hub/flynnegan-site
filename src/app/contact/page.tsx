import { SiteShell } from "@/components/SiteShell";
import { getNavSections, getSiteMeta } from "@/lib/content/store";

export default async function ContactPage() {
  const [sections, site] = await Promise.all([getNavSections(), getSiteMeta()]);

  return (
    <SiteShell
      sections={sections}
      brandTitle={site.title}
      tagline={site.tagline}
    >
      <article style={{ maxWidth: "40rem" }}>
        <h1 className="work-title" style={{ marginBottom: "1.5rem" }}>
          Contact
        </h1>
        <div className="work-meta">
          For commissions, availability, and sales questions, email{" "}
          <a
            href="mailto:hello@flynnegan.com"
            style={{ textDecoration: "underline", textUnderlineOffset: "0.15em" }}
          >
            hello@flynnegan.com
          </a>
          .
          {"\n\n"}
          Replace this address in admin/content when you have the preferred contact.
        </div>
      </article>
    </SiteShell>
  );
}
