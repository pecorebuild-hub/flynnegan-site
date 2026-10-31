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
          <Link href="/information">Information</Link>
          <br />
          <Link href="/contact">Contact</Link> me
        </div>
        <div style={{ marginTop: "1.25rem" }}>
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
            Commissions
          </Link>
        </div>
      </nav>
    </aside>
  );
}
