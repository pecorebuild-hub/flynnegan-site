import Link from "next/link";
import type { SiteSection } from "@/lib/types";
import { splitBrandTitle } from "@/lib/types";

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
  const { line1, line2 } = splitBrandTitle(brandTitle);

  return (
    <aside className="site-nav">
      <div>
        <Link href="/" className="brand">
          <span className="brand-line">{line1}</span>
          {line2 ? <span className="brand-line">{line2}</span> : null}
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
            Contact me
          </Link>
        </div>
        <div className="nav-selected">
          <span className="nav-label">Selected</span>
          <br />
          {sections.map((section, index) => (
            <span key={section.id}>
              <Link
                href={`/${section.slug}`}
                className={activeSection === section.slug ? "active" : undefined}
              >
                [{index + 1}] {section.title}
              </Link>
              <br />
            </span>
          ))}
          <Link
            href="/commissions"
            className={activeSection === "commissions" ? "active" : undefined}
          >
            [{selectedCount + 1}] Commissions
          </Link>
        </div>
      </nav>
    </aside>
  );
}
