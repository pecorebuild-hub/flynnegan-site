/**
 * Custom Substack signup — left-aligned, no publication header,
 * responsive on mobile. Uses Substack's free-subscribe endpoint.
 */
export function SubstackSubscribe() {
  return (
    <div className="nav-substack">
      <form
        className="nav-substack-form"
        action="https://flynnegan.substack.com/api/v1/free?nojs=true"
        method="post"
        target="_blank"
        rel="noopener noreferrer"
      >
        <input type="hidden" name="source" value="website" />
        <input
          type="hidden"
          name="current_url"
          value="https://gayart.studio/"
        />
        <label className="nav-substack-label" htmlFor="substack-email">
            Stay In Touch
        </label>
        <div className="nav-substack-row">
          <input
            id="substack-email"
            className="nav-substack-input"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Type your email…"
          />
          <button className="nav-substack-btn" type="submit">
            Subscribe
          </button>
        </div>
        <p className="nav-substack-legal">
          By subscribing you agree to Substack&apos;s{" "}
          <a href="https://substack.com/tos" target="_blank" rel="noreferrer">
            Terms
          </a>
          ,{" "}
          <a
            href="https://substack.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </div>
  );
}
