/**
 * Information page was private on Cargo and not in the saved HTML export.
 * This restores the public-facing copy that matches the site positioning;
 * replace if you have the original Information page text.
 */
export function InformationContent() {
  return (
    <article className="page-prose">
      <h1 className="page-heading">Information</h1>

      <p className="lede">
        Erotic Male Fine Art — gay / queer BDSM gothic dark prints and custom
        artwork by Flynn Egan.
      </p>

      <section className="commission-tier">
        <h2>Prints</h2>
        <p>
          Giclée fine art prints on Hahnemühle paper. Works are typically issued
          in limited editions (e.g. Ed. 10/10). Size and edition details are
          listed on each piece.
        </p>
      </section>

      <section className="commission-tier">
        <h2>Metal Plaques</h2>
        <p>
          Prints on aluminium with a sheer matte finish (Dibond-style metal
          plaque). Common format in the current selection:{" "}
          <strong>20 × 30 cm</strong>. Exact size is shown on each work.
        </p>
      </section>

      <section className="commission-tier">
        <h2>Buying</h2>
        <p>
          Purchase links go to Throne. Each work’s button opens that listing in
          a new tab.
        </p>
      </section>

      <section className="commission-tier">
        <h2>Commissions</h2>
        <p>
          Private custom work is available — see{" "}
          <a href="/commissions">Commissions</a> for tiers, turnaround, and
          terms.
        </p>
      </section>

      <p className="muted-note">
        If you have the original Cargo Information text, send it and this page
        will be replaced 1:1.
      </p>
    </article>
  );
}
