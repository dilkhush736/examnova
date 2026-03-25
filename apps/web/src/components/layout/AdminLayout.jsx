import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="dashboard-shell admin-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Admin control</p>
          <h2>Operations Center</h2>
          <p className="support-copy sidebar-copy">
            Users, listings, commerce, and payout workflows live here.
          </p>
        </div>
        <nav className="sidebar-nav">
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/dashboard">Overview</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/analytics">Analytics</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/moderation">Moderation</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/alerts">Alerts</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/audit-logs">Audit logs</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/uploads">Admin uploads</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/upcoming">Upcoming locked</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/users">Users</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/listings">Listings</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/commerce">Commerce</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} to="/admin/withdrawals">Withdrawals</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footnote">
            <strong>Ops posture</strong>
            <span>Content, risk, finance, and user health in one console.</span>
          </div>
          <button className="button ghost" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
