import Link from "next/link";
import type { SiteSection } from "@/lib/types";

type Props = {
  sections: SiteSection[];
  activeSection?: string | null;
  brandTitle: string;
  tagline: string;
};

export function SideNav({
  sections,
  activeSection,
  brandTitle,
  tagline,
}: Props) {
  const selectedCount = sections.length;

  return (
    <aside className="site-nav">
      <div>
        <Link href="/" className="brand">
          {brandTitle}
        </Link>
        <p className="brand-muted">{tagline}</p>
      </div>

      <nav className="nav-block" aria-label="Primary">
        <div>
          <Link
            href="/information"
            className={activeSection === "information" ? "active" : undefined}
          >
            Information
          </Link>
          <br />
          <Link
            href="/contact"
            className={activeSection === "contact" ? "active" : undefined}
          >
            Contact
          </Link>{" "}
          me
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <span className="nav-label">Selected</span>
          <br />
          {sections.map((section, index) => (
            <span key={section.id}>
              <Link
                href={`/${section.slug}`}
                className={activeSection === section.slug ? "active" : undefined}
              >
                {index + 1}/ {section.title}
              </Link>
              <br />
            </span>
          ))}
          <Link
            href="/commissions"
            className={activeSection === "commissions" ? "active" : undefined}
          >
            {selectedCount + 1}/ Commissions
          </Link>
        </div>
      </nav>
    </aside>
  );
}
