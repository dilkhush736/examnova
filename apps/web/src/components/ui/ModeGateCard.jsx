import { Link } from "react-router-dom";
import {
  DEVELOPER_UNLOCK_PRICE,
  MODE_LABELS,
  PLATFORM_MODES,
} from "../../utils/modes.js";

export function ModeGateCard({ requiredMode, modeAccess }) {
  const developerUnlocked = Boolean(modeAccess?.developerUnlocked);
  const unlockAmount =
    Number(modeAccess?.developerUnlockAmountInr) || DEVELOPER_UNLOCK_PRICE;
  const needsDeveloperUpgrade =
    requiredMode === PLATFORM_MODES.DEVELOPER && !developerUnlocked;

  const title = needsDeveloperUpgrade
    ? "Developer Mode required"
    : `${MODE_LABELS[requiredMode]} required`;
  const description = needsDeveloperUpgrade
    ? `This workspace is reserved for Developer Mode so selling stays controlled. Unlock it for Rs. ${unlockAmount} from your account settings, then switch into Developer Mode.`
    : requiredMode === PLATFORM_MODES.DEVELOPER
      ? "Your account already has access, but you are currently in Professional Mode. Switch into Developer Mode to continue."
      : "This part of ExamNova AI belongs to the logged-in Professional workspace.";

  return (
    <section className="stack-section">
      <article className="detail-card mode-gate-card">
        <p className="eyebrow">Mode access</p>
        <h2>{title}</h2>
        <p className="support-copy">{description}</p>
        <div className="mode-chip-row">
          <span className="status-chip">
            <i className="bi bi-person-badge-fill" />
            Current: {MODE_LABELS[modeAccess?.currentMode] || MODE_LABELS[PLATFORM_MODES.PROFESSIONAL]}
          </span>
          <span className="status-chip muted">
            <i className="bi bi-stars" />
            Required: {MODE_LABELS[requiredMode]}
          </span>
        </div>
        <div className="hero-actions">
          <Link className="button primary" to="/app/settings#mode-access">
            <i className={`bi ${needsDeveloperUpgrade ? "bi-lightning-charge-fill" : "bi-arrow-repeat"}`} />
            {needsDeveloperUpgrade
              ? `Unlock Developer Mode for Rs. ${unlockAmount}`
              : "Open mode settings"}
          </Link>
          <Link className="button secondary" to="/marketplace">
            <i className="bi bi-shop" />
            Back to marketplace
          </Link>
        </div>
      </article>
    </section>
  );
}
