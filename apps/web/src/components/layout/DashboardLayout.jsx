import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  hasDeveloperAccess,
  MODE_LABELS,
  normalizeModeAccess,
} from "../../utils/modes.js";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const userInitial = (user?.name || "S").trim().charAt(0).toUpperCase();
  const modeAccess = normalizeModeAccess(user);
  const developerActive = hasDeveloperAccess(modeAccess);
  const navItems = [
    { to: "/marketplace", label: "Marketplace", icon: "bi-shop-window", meta: "Discover and buy PDFs" },
    { to: "/app/upload-generate", label: "AI Workflow", icon: "bi-cloud-arrow-up-fill", meta: "Upload, detect, generate" },
    { to: "/app/generated-pdfs", label: "Generated PDFs", icon: "bi-file-earmark-pdf-fill", meta: "Rendered outputs" },
    { to: "/app/purchased-pdfs", label: "Purchased PDFs", icon: "bi-bag-check-fill", meta: "Buyer library" },
    ...(developerActive
      ? [
        { to: "/app/listed-pdfs", label: "Listed PDFs", icon: "bi-shop", meta: "Seller catalogue" },
        { to: "/app/wallet", label: "Wallet", icon: "bi-wallet2", meta: "Balance and ledger" },
        { to: "/app/withdrawals", label: "Withdrawals", icon: "bi-cash-stack", meta: "Payout requests" },
      ]
      : []),
    { to: "/app/notifications", label: "Notifications", icon: "bi-bell-fill", meta: "Signals and alerts" },
    { to: "/app/profile", label: "Profile", icon: "bi-person-badge-fill", meta: "Identity surface" },
    { to: "/app/settings", label: "Settings", icon: "bi-sliders2-vertical", meta: "Mode and preference control" },
    { to: "/app/payments", label: "Payments", icon: "bi-credit-card-2-front-fill", meta: "Receipt history" },
    { to: "/app/dashboard", label: "Overview", icon: "bi-grid-1x2-fill", meta: "Workspace summary" },
  ];

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-mark" aria-hidden="true">
              <i className="bi bi-stars" />
            </div>
            <div className="sidebar-brand-copy">
              <span className="layout-kicker">{developerActive ? "Developer Workspace" : "Professional Workspace"}</span>
              <strong className="brand">ExamNova AI</strong>
            </div>
          </div>
          <div className="sidebar-user-card">
            <p className="eyebrow">Active mode</p>
            <h2>{user?.name || "Student"}</h2>
            <p className="support-copy">
              {MODE_LABELS[modeAccess.currentMode]} {user?.academicProfile?.semester ? `- Semester ${user.academicProfile.semester}` : ""}
            </p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
              to={item.to}
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                <i className={`bi ${item.icon}`} />
              </span>
              <span className="sidebar-link-copy">
                <span>{item.label}</span>
                <small>{item.meta}</small>
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footnote">
            <strong>{developerActive ? "Developer flow" : "Professional flow"}</strong>
            <span>{developerActive ? "Upload, generate, publish, sell." : "Upload, detect, answer, render."}</span>
          </div>
          <button className="button ghost" onClick={logout} type="button">
            <i className="bi bi-box-arrow-left" />
            Logout
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-identity">
            <div className="identity-orb">{userInitial}</div>
            <div className="dashboard-topbar-copy">
              <p className="eyebrow">Mode-aware workspace</p>
              <h1>{user?.name || "User dashboard"}</h1>
              <p className="support-copy">
                Start in the marketplace, then use {MODE_LABELS[modeAccess.currentMode].toLowerCase()} tools that match your account access without extra clutter.
              </p>
            </div>
          </div>
          <div className="topbar-chip-group">
            <span className="status-chip"><i className="bi bi-patch-check-fill" />{user?.isEmailVerified ? "Email verified" : "Verification pending"}</span>
            <span className="status-chip"><i className="bi bi-stars" />{MODE_LABELS[modeAccess.currentMode]}</span>
            <span className="status-chip muted"><i className="bi bi-person-fill" />{user?.role || "student"}</span>
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
