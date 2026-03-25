import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="hero-card">
      <p className="eyebrow">404</p>
      <h1>Page not found.</h1>
      <p className="support-copy">The route you requested does not exist in the current app shell.</p>
      <div className="hero-actions">
        <Link className="button primary" to="/">
          Go home
        </Link>
      </div>
    </section>
  );
}
