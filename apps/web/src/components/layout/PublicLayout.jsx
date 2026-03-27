import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { SeoHead } from "../../seo/SeoHead.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ThemeToggleButton } from "../ui/ThemeToggleButton.jsx";
import {
  MODE_CATALOG,
  MODE_LABELS,
  PLATFORM_MODES,
  normalizeModeAccess,
} from "../../utils/modes.js";

function buildSettingsPayload(user, nextMode) {
  return {
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    productUpdates: user?.preferences?.productUpdates ?? true,
    marketplaceAlerts: user?.preferences?.marketplaceAlerts ?? true,
    currentMode: nextMode,
  };
}

function createPublicSections({ isAuthenticated, isAdminSession, modeAccess }) {
  const sections = [
    {
      title: "Browse",
      items: [
        {
          type: "link",
          to: "/marketplace",
          icon: "bi-grid-1x2-fill",
          label: "Marketplace",
          meta: "Open all public PDF cards",
        },
        {
          type: "anchor",
          href: "#mode-switcher",
          icon: "bi-layers-fill",
          label: "Modes",
          meta: "Simple, Professional, Developer",
        },
        {
          type: "anchor",
          href: "#public-footer",
          icon: "bi-info-circle-fill",
          label: "How it works",
          meta: "See the quick PDF flow",
        },
      ],
    },
  ];

  if (!isAuthenticated) {
    sections.push({
      title: "Account",
      items: [
        {
          type: "link",
          to: "/login",
          icon: "bi-box-arrow-in-right",
          label: "Login",
          meta: "Continue with your existing account",
        },
        {
          type: "link",
          to: "/signup",
          icon: "bi-person-plus-fill",
          label: "Register",
          meta: "Create a new ExamNova account",
        },
      ],
    });

    return sections;
  }

  if (isAdminSession) {
    sections.push({
      title: "Admin tools",
      items: [
        {
          type: "link",
          to: "/admin/profile",
          icon: "bi-speedometer2",
          label: "Admin center",
          meta: "Open admin control center",
        },
        {
          type: "link",
          to: "/admin/uploads",
          icon: "bi-cloud-arrow-up-fill",
          label: "Uploads",
          meta: "Manage admin-owned PDFs",
        },
        {
          type: "link",
          to: "/admin/listings",
          icon: "bi-journal-richtext",
          label: "Listings",
          meta: "Moderate marketplace catalog",
        },
      ],
    });

    return sections;
  }

  sections.push({
    title: "Workspace",
    items: [
      {
        type: "link",
        to: "/app/profile",
        icon: "bi-person-circle",
        label: "My account",
        meta: `${MODE_LABELS[modeAccess.currentMode]} active`,
      },
      {
        type: "link",
        to: "/app/purchased-pdfs",
        icon: "bi-bag-check-fill",
        label: "Purchased PDFs",
        meta: "See downloaded and paid PDFs",
      },
      {
        type: "link",
        to: "/app/upload-generate",
        icon: "bi-magic",
        label: "AI workflow",
        meta: "Upload and generate AI PDFs",
      },
    ],
  });

  sections.push({
    title: "Seller tools",
    items: modeAccess.developerUnlocked
      ? [
          {
            type: "link",
            to: "/app/listed-pdfs",
            icon: "bi-shop-window",
            label: "Listed PDFs",
            meta: "Manage public seller listings",
          },
          {
            type: "link",
            to: "/app/wallet",
            icon: "bi-wallet2",
            label: "Wallet",
            meta: "Check seller earnings",
          },
          {
            type: "link",
            to: "/app/withdrawals",
            icon: "bi-cash-stack",
            label: "Withdrawals",
            meta: "Request payout to bank or UPI",
          },
        ]
      : [
          {
            type: "link",
            to: "/app/settings#mode-access",
            icon: "bi-lock-fill",
            label: "Unlock developer",
            meta: "Enable public selling tools",
          },
        ],
  });

  return sections;
}

export function PublicLayout() {
  const {
    isAuthenticated,
    logout,
    role,
    updateSettings,
    user,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  const [modeFeedback, setModeFeedback] = useState({ type: "", message: "" });

  const isPdfDetailPage = location.pathname.startsWith("/pdf/");
  const isMarketplacePage = location.pathname === "/" || location.pathname === "/marketplace";
  const isWidePublicPage = isMarketplacePage || isPdfDetailPage;
  const isAdminSession = isAuthenticated && role === "admin";
  const modeAccess = normalizeModeAccess(user);
  const activeMode = !isAuthenticated
    ? PLATFORM_MODES.SIMPLE
    : isAdminSession
      ? PLATFORM_MODES.DEVELOPER
      : modeAccess.currentMode;
  const accountHref = isAuthenticated ? (isAdminSession ? "/admin/profile" : "/app/profile") : "/login";
  const accountLabel = isAuthenticated ? (isAdminSession ? "Admin center" : "My account") : "Login";
  const extraSections = useMemo(
    () => createPublicSections({ isAuthenticated, isAdminSession, modeAccess }),
    [isAdminSession, isAuthenticated, modeAccess],
  );

  useEffect(() => {
    setIsSidebarOpen(false);
    setModeFeedback({ type: "", message: "" });
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  async function handleModeSelect(nextMode) {
    setModeFeedback({ type: "", message: "" });

    if (nextMode === PLATFORM_MODES.SIMPLE) {
      navigate("/marketplace");
      setIsSidebarOpen(false);
      return;
    }

    if (!isAuthenticated) {
      navigate(nextMode === PLATFORM_MODES.DEVELOPER ? "/signup" : "/login");
      setIsSidebarOpen(false);
      return;
    }

    if (isAdminSession) {
      navigate("/admin/profile");
      setIsSidebarOpen(false);
      return;
    }

    if (nextMode === PLATFORM_MODES.DEVELOPER && !modeAccess.developerUnlocked) {
      navigate("/app/settings#mode-access");
      setIsSidebarOpen(false);
      return;
    }

    if (nextMode !== modeAccess.currentMode) {
      setIsModeSwitching(true);

      try {
        await updateSettings(buildSettingsPayload(user, nextMode));
        setModeFeedback({
          type: "success",
          message: `${MODE_LABELS[nextMode]} is now active for your account.`,
        });
      } catch (error) {
        setModeFeedback({
          type: "error",
          message: error.message || "Unable to switch mode right now.",
        });
        setIsModeSwitching(false);
        return;
      } finally {
        setIsModeSwitching(false);
      }
    }

    navigate(nextMode === PLATFORM_MODES.DEVELOPER ? "/app/listed-pdfs" : "/app/profile");
    setIsSidebarOpen(false);
  }

  async function handleLogout() {
    await logout();
    navigate("/marketplace");
    setIsSidebarOpen(false);
  }

  return (
    <div
      className={`site-shell public-shell${isWidePublicPage ? " public-shell-wide" : ""}${isPdfDetailPage ? " public-shell-detail" : ""}`}
    >
      <SeoHead title="ExamNova AI" description="AI-powered exam preparation platform and PDF marketplace." />

      <header className="public-mobile-navbar">
        <div className="public-mobile-navbar-card">
          <div className="public-mobile-navbar-top">
            <Link className="public-mobile-brand" to="/marketplace">
              <span className="public-mobile-brand-mark" aria-hidden="true">
                <i className="bi bi-file-earmark-pdf-fill" />
              </span>
              <span className="public-mobile-brand-copy">
                <small>ExamNova AI</small>
                <strong>PDF Marketplace</strong>
              </span>
            </Link>

            <div className="public-mobile-navbar-tools">
              <ThemeToggleButton compact className="public-mobile-theme-toggle" />
              <button
                aria-controls="public-sidebar"
                aria-expanded={isSidebarOpen}
                aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
                className="public-mobile-menu-button"
                onClick={() => setIsSidebarOpen((current) => !current)}
                type="button"
              >
                <i className={`bi ${isSidebarOpen ? "bi-x-lg" : "bi-list"}`} />
              </button>
            </div>
          </div>

          <div className="public-mobile-navbar-bottom">
            <p className="public-mobile-navbar-copy">
              Mobile-first PDF browsing, secure payment, and clean mode access for students.
            </p>
            <div className="public-mobile-auth-actions">
              {isAuthenticated ? (
                <>
                  <Link className="btn btn-primary public-mobile-auth-button" to={accountHref}>
                    <i className="bi bi-person-circle" />
                    {accountLabel}
                  </Link>
                  <button className="btn btn-outline-secondary public-mobile-auth-button" onClick={handleLogout} type="button">
                    <i className="bi bi-box-arrow-right" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-secondary public-mobile-auth-button" to="/login">
                    <i className="bi bi-box-arrow-in-right" />
                    Login
                  </Link>
                  <Link className="btn btn-primary public-mobile-auth-button" to="/signup">
                    <i className="bi bi-person-plus-fill" />
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="public-mode-strip" id="mode-switcher">
        <div className="public-mode-strip-head">
          <div>
            <p className="eyebrow">Choose mode</p>
            <h2>Simple, Professional, or Developer</h2>
          </div>
          <button className="public-sidebar-link-button" onClick={() => setIsSidebarOpen(true)} type="button">
            <i className="bi bi-grid-3x3-gap-fill" />
            Extra features
          </button>
        </div>

        <div className="public-mode-strip-grid">
          {MODE_CATALOG.map((mode) => {
            const isActive = activeMode === mode.id;
            const isLocked =
              mode.id === PLATFORM_MODES.DEVELOPER && isAuthenticated && !isAdminSession && !modeAccess.developerUnlocked;

            return (
              <button
                className={`public-mode-card${isActive ? " active" : ""}`}
                disabled={isModeSwitching}
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                type="button"
              >
                <div className="public-mode-card-top">
                  <strong>{mode.label}</strong>
                  <span className={`public-mode-badge${isActive ? " active" : ""}`}>
                    {isLocked ? "Locked" : isActive ? "Active" : mode.badge}
                  </span>
                </div>
                <p>{mode.description}</p>
              </button>
            );
          })}
        </div>

        {modeFeedback.message ? (
          <p className={modeFeedback.type === "error" ? "form-error" : "form-success"}>{modeFeedback.message}</p>
        ) : null}
      </section>

      <main className={`page-shell${isWidePublicPage ? " page-shell-wide" : ""}${isPdfDetailPage ? " page-shell-detail" : ""}`}>
        <Outlet />
      </main>

      <footer className="public-mobile-footer" id="public-footer">
        <div className="public-mobile-footer-card">
          <div className="public-mobile-footer-hero">
            <div>
              <p className="eyebrow">ExamNova AI</p>
              <h3>One clean mobile-first place to browse, pay, and download PDFs.</h3>
            </div>
            <div className="public-mobile-footer-hero-actions">
              <Link className="btn btn-primary public-mobile-footer-button" to="/marketplace">
                <i className="bi bi-search" />
                Browse PDFs
              </Link>
              <Link className="btn btn-outline-secondary public-mobile-footer-button" to={accountHref}>
                <i className={`bi ${isAuthenticated ? "bi-person-circle" : "bi-box-arrow-in-right"}`} />
                {accountLabel}
              </Link>
            </div>
          </div>

          <div className="public-mobile-footer-grid">
            <article className="public-mobile-footer-panel">
              <span className="public-mobile-footer-label">Quick links</span>
              <Link to="/marketplace">Marketplace</Link>
              <a href="#mode-switcher">Mode switch</a>
              <a href="#public-footer">Download flow</a>
            </article>
            <article className="public-mobile-footer-panel">
              <span className="public-mobile-footer-label">Flow</span>
              <p>1. Open a PDF</p>
              <p>2. Enter your full name</p>
              <p>3. Pay and download securely</p>
            </article>
            <article className="public-mobile-footer-panel">
              <span className="public-mobile-footer-label">Why it feels simple</span>
              <div className="public-mobile-footer-chips">
                <span>Mobile first</span>
                <span>Login optional</span>
                <span>Secure payment</span>
                <span>Mode-aware</span>
              </div>
            </article>
          </div>

          <div className="public-mobile-footer-bottom">
            <p>Public website stays focused on PDF discovery first. Extra tools stay inside mode access and sidebar navigation.</p>
            <ThemeToggleButton compact className="public-mobile-theme-toggle footer-theme-toggle" />
          </div>
        </div>
      </footer>

      <div
        aria-hidden={!isSidebarOpen}
        className={`public-sidebar-overlay${isSidebarOpen ? " open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        aria-hidden={!isSidebarOpen}
        className={`public-sidebar-drawer${isSidebarOpen ? " open" : ""}`}
        id="public-sidebar"
      >
        <div className="public-sidebar-header">
          <div className="public-sidebar-brand">
            <span className="public-mobile-brand-mark" aria-hidden="true">
              <i className="bi bi-stars" />
            </span>
            <div className="public-mobile-brand-copy">
              <small>Explore more</small>
              <strong>ExamNova Sidebar</strong>
            </div>
          </div>
          <button className="public-mobile-menu-button" onClick={() => setIsSidebarOpen(false)} type="button">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="public-sidebar-body">
          {extraSections.map((section) => (
            <section className="public-sidebar-section" key={section.title}>
              <span className="public-sidebar-section-title">{section.title}</span>
              <div className="public-sidebar-link-list">
                {section.items.map((item) =>
                  item.type === "anchor" ? (
                    <a className="public-sidebar-link" href={item.href} key={`${section.title}-${item.label}`} onClick={() => setIsSidebarOpen(false)}>
                      <span className="public-sidebar-link-icon"><i className={`bi ${item.icon}`} /></span>
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.meta}</small>
                      </span>
                    </a>
                  ) : (
                    <Link className="public-sidebar-link" key={`${section.title}-${item.label}`} onClick={() => setIsSidebarOpen(false)} to={item.to}>
                      <span className="public-sidebar-link-icon"><i className={`bi ${item.icon}`} /></span>
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.meta}</small>
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </section>
          ))}

          <section className="public-sidebar-section public-sidebar-mode-section">
            <span className="public-sidebar-section-title">Modes</span>
            <div className="public-sidebar-mode-list">
              {MODE_CATALOG.map((mode) => (
                <button
                  className={`public-sidebar-mode-item${activeMode === mode.id ? " active" : ""}`}
                  disabled={isModeSwitching}
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  type="button"
                >
                  <strong>{mode.label}</strong>
                  <small>{mode.badge}</small>
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
