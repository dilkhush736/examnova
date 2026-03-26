import { useTheme } from "../../hooks/useTheme.js";

export function ThemeToggleButton({ className = "", compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDarkTheme = theme === "dark";
  const iconClass = isDarkTheme ? "bi-moon-stars-fill" : "bi-brightness-high-fill";
  const label = isDarkTheme ? "Dark mode" : "Light mode";
  const themeHint = isDarkTheme ? "Switch to light" : "Switch to dark";

  return (
    <button
      aria-label={themeHint}
      className={`theme-toggle${compact ? " compact" : ""}${className ? ` ${className}` : ""}`}
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true" className="theme-toggle-icon">
        <i className={`bi ${iconClass}`} />
      </span>
      <span className="theme-toggle-copy">
        <small>Theme</small>
        <strong>{label}</strong>
      </span>
    </button>
  );
}
