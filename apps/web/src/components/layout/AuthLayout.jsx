import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Secure access</p>
          <h1>Secure access for serious exam prep.</h1>
          <p className="support-copy">
            Signup, verify your email, and move into your exam workspace with a clean, production-ready auth flow.
          </p>
        </div>
        <Outlet />
      </section>
    </div>
  );
}
