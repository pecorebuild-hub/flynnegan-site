import { SideNav } from "./SideNav";
import type { SiteSection } from "@/lib/types";

type Props = {
  children: React.ReactNode;
  sections: SiteSection[];
  activeSection?: string | null;
  brandTitle: string;
  tagline: string;
};

export function SiteShell({
  children,
  sections,
  activeSection,
  brandTitle,
  tagline,
}: Props) {
  return (
    <div className="site-shell">
      <SideNav
        sections={sections}
        activeSection={activeSection}
        brandTitle={brandTitle}
        tagline={tagline}
      />
      <div className="site-main">
        {children}
        <footer className="site-footer">©{new Date().getFullYear()} Flynn Egan.</footer>
      </div>
    </div>
  );
}
