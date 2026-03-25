import { Link, Outlet } from "react-router-dom";
import { SeoHead } from "../../seo/SeoHead.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export function PublicLayout() {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="site-shell public-shell">
      <SeoHead title="ExamNova AI" description="AI-powered exam preparation platform and PDF marketplace." />
      <header className="topbar">
        <div className="topbar-brand-cluster">
          <Link to="/" className="brand">
            ExamNova AI
          </Link>
          <span className="layout-kicker">Exam-tech workspace and marketplace</span>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/upcoming">Upcoming</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/faq">FAQ</Link>
          {isAuthenticated ? (
            <Link className="nav-cta" to={role === "admin" ? "/admin/dashboard" : "/app/dashboard"}>Dashboard</Link>
          ) : (
            <Link className="nav-cta" to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
      <footer className="footer-bar">
        <div>
          <strong>ExamNova AI</strong>
          <p>Compact exam PDFs, structured marketplace listings, and premium student workflows.</p>
        </div>
        <div className="footer-links">
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/faq">FAQ</Link>
        </div>
      </footer>
    </div>
  );
}
