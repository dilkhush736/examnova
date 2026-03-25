import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

const navItems = [
  { to: "/app/dashboard", label: "Overview" },
  { to: "/app/upload-generate", label: "Upload & Generate" },
  { to: "/app/generated-pdfs", label: "Generated PDFs" },
  { to: "/app/purchased-pdfs", label: "Purchased PDFs" },
  { to: "/app/listed-pdfs", label: "Listed PDFs" },
  { to: "/app/wallet", label: "Wallet" },
  { to: "/app/withdrawals", label: "Withdrawals" },
  { to: "/app/payments", label: "Payments" },
  { to: "/app/notifications", label: "Notifications" },
  { to: "/app/profile", label: "Profile" },
  { to: "/app/settings", label: "Settings" },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Student workspace</p>
          <h2>{user?.name || "Student"}</h2>
          <p className="support-copy sidebar-copy">
            {user?.academicProfile?.university || "ExamNova account"} {user?.academicProfile?.semester ? `- ${user.academicProfile.semester}` : ""}
          </p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footnote">
            <strong>Exam flow</strong>
            <span>Upload, detect, answer, render, publish.</span>
          </div>
          <button className="button ghost" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">Account area</p>
            <h1>{user?.name || "User dashboard"}</h1>
          </div>
          <div className="topbar-chip-group">
            <span className="status-chip">{user?.isEmailVerified ? "Email verified" : "Verification pending"}</span>
            <span className="status-chip muted">{user?.role || "student"}</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
