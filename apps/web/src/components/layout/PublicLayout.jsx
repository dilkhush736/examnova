import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ThemeToggleButton } from "../ui/ThemeToggleButton.jsx";
import { SeoHead } from "../../seo/SeoHead.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export function PublicLayout() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const workspaceHref = isAuthenticated ? (role === "admin" ? "/admin/profile" : "/app/profile") : "/signup";
  const workspaceLabel = isAuthenticated ? (role === "admin" ? "Admin center" : "Open workspace") : "Create account";
  const navItems = [
    { to: "/marketplace", label: "Marketplace", icon: "bi-shop-window" },
    { to: "/upcoming", label: "Upcoming", icon: "bi-hourglass-split" },
    { to: "/resources", label: "Resources", icon: "bi-journal-richtext" },
    { to: "/faq", label: "FAQ", icon: "bi-patch-question" },
  ];

  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="site-shell public-shell">
      <SeoHead title="ExamNova AI" description="AI-powered exam preparation platform and PDF marketplace." />
      <div className="public-utility-bar">
        <div className="public-utility-pills">
          <span className="public-utility-pill"><i className="bi bi-shop-window" />Marketplace-first</span>
          <span className="public-utility-pill"><i className="bi bi-shield-check" />Guest PDF checkout</span>
          <span className="public-utility-pill"><i className="bi bi-stars" />AI workflow after login</span>
        </div>
        <Link className="public-utility-link" to="/faq">
          <i className="bi bi-arrow-right-short" />
          How it works
        </Link>
      </div>
      <header className="topbar public-navbar">
        <div className="topbar-brand-wrap">
          <div className="brand-mark" aria-hidden="true">
            <i className="bi bi-stars" />
          </div>
          <div className="topbar-brand-cluster">
            <span className="layout-kicker">Premium Exam Intelligence</span>
            <Link to="/" className="brand">
              ExamNova AI
            </Link>
            <p className="brand-subcopy">
              Discover premium study PDFs first, then move into AI generation, seller tools, or admin controls only when you need them.
            </p>
          </div>
        </div>
        <button
          aria-expanded={isNavOpen}
          aria-label={isNavOpen ? "Close navigation menu" : "Open navigation menu"}
          className="public-nav-toggle"
          onClick={() => setIsNavOpen((current) => !current)}
          type="button"
        >
          <i className={`bi ${isNavOpen ? "bi-x-lg" : "bi-list"}`} />
        </button>
        <div className={`public-nav-panel${isNavOpen ? " open" : ""}`}>
          <nav className="public-nav-links">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) => `nav-link-pill public-nav-link${isActive ? " active" : ""}`}
                key={item.to}
                to={item.to}
              >
                <i className={`bi ${item.icon}`} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="public-nav-actions">
            <ThemeToggleButton compact />
            {isAuthenticated ? (
              <Link className="nav-link-pill" to={role === "admin" ? "/admin/profile" : "/app/profile"}>
                <i className="bi bi-person-badge" />
                {role === "admin" ? "Admin center" : "Open workspace"}
              </Link>
            ) : (
              <Link className="nav-link-pill" to="/login">
                <i className="bi bi-box-arrow-in-right" />
                Login
              </Link>
            )}
            <Link className="nav-link-pill nav-cta" to={workspaceHref}>
              <i className={`bi ${isAuthenticated ? "bi-arrow-up-right-circle-fill" : "bi-person-plus-fill"}`} />
              {workspaceLabel}
            </Link>
          </div>
        </div>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
      <footer className="footer-bar public-footer">
        <div className="footer-grid public-footer-grid">
          <section className="footer-block public-footer-brand">
            <p className="eyebrow">ExamNova AI</p>
            <h3>Marketplace-first exam prep with premium AI workflows.</h3>
            <p className="support-copy">
              Browse public PDFs without friction, unlock Professional Mode for AI generation, and move into Developer Mode only if you want to publish and sell.
            </p>
            <div className="footer-stat-row">
              <span className="footer-stat"><i className="bi bi-shop" />Scannable PDF marketplace</span>
              <span className="footer-stat"><i className="bi bi-lock" />Secure checkout</span>
              <span className="footer-stat"><i className="bi bi-cpu" />AI-ready workspace</span>
            </div>
          </section>
          <section className="footer-block">
            <h4>Explore</h4>
            <div className="footer-links">
              <Link className="footer-link-pill" to="/marketplace">Marketplace</Link>
              <Link className="footer-link-pill" to="/upcoming">Upcoming</Link>
              <Link className="footer-link-pill" to="/resources">Resources</Link>
              <Link className="footer-link-pill" to="/faq">FAQ</Link>
            </div>
          </section>
          <section className="footer-block">
            <h4>Platform modes</h4>
            <div className="footer-links">
              <Link className="footer-link-pill" to="/marketplace">Simple Mode</Link>
              <Link className="footer-link-pill" to="/signup">Professional Mode</Link>
              <Link className="footer-link-pill" to="/signup">Developer Mode</Link>
            </div>
            <p className="support-copy">Clear upgrade paths keep first-time users focused instead of overwhelmed.</p>
          </section>
          <section className="footer-block">
            <h4>Trust and support</h4>
            <p className="support-copy">
              Professional navigation, guided filters, secure PDF access, and cleaner account areas make the product feel reliable on both mobile and desktop.
            </p>
            <div className="hero-actions">
              <Link className="button secondary" to="/faq">Read FAQs</Link>
            </div>
          </section>
        </div>
        <div className="public-footer-bottom">
          <p className="public-footer-note">
            Built for students who want a simpler first step, a stronger marketplace, and a more trustworthy AI SaaS experience.
          </p>
          <div className="public-footer-bottom-actions">
            <ThemeToggleButton compact />
            <Link className="nav-link-pill nav-cta" to={workspaceHref}>
              <i className={`bi ${isAuthenticated ? "bi-arrow-up-right-circle-fill" : "bi-person-plus-fill"}`} />
              {workspaceLabel}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
