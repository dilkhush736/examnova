import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { FormSwitchRow } from "../../components/ui/FormSwitchRow.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  createDeveloperModeOrder,
  verifyDeveloperModePayment,
} from "../../services/api/index.js";
import { loadRazorpayCheckout } from "../../utils/loadRazorpayCheckout.js";
import {
  MODE_CATALOG,
  MODE_LABELS,
  normalizeModeAccess,
  PLATFORM_MODES,
} from "../../utils/modes.js";

function buildSettingsFromUser(user) {
  const modeAccess = normalizeModeAccess(user);

  return {
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    productUpdates: user?.preferences?.productUpdates ?? true,
    marketplaceAlerts: user?.preferences?.marketplaceAlerts ?? true,
    currentMode: modeAccess.currentMode,
  };
}

export function AccountSettingsPage() {
  const { accessToken, refreshProfile, updateSettings, user } = useAuth();
  const [settings, setSettings] = useState(buildSettingsFromUser(user));
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlockingDeveloper, setIsUnlockingDeveloper] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    setSettings(buildSettingsFromUser(user));
  }, [user]);

  const modeAccess = normalizeModeAccess(user);
  const developerUnlockedAtLabel = modeAccess.developerUnlockedAt
    ? new Date(modeAccess.developerUnlockedAt).toLocaleString()
    : "";

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: "", message: "" });
    setIsSaving(true);

    try {
      await updateSettings(settings);
      setFeedback({ type: "success", message: "Settings saved successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to save settings." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleModeSwitch(nextMode) {
    if (!user || nextMode === modeAccess.currentMode) {
      return;
    }

    const nextSettings = {
      ...settings,
      currentMode: nextMode,
    };

    setFeedback({ type: "", message: "" });
    setIsSaving(true);

    try {
      await updateSettings(nextSettings);
      setSettings(nextSettings);
      setFeedback({
        type: "success",
        message: `${MODE_LABELS[nextMode]} is now active for your account.`,
      });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to switch account mode." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnlockDeveloperMode() {
    if (!accessToken) {
      setFeedback({ type: "error", message: "Please log in again before unlocking Developer Mode." });
      return;
    }

    setFeedback({ type: "", message: "" });
    setIsUnlockingDeveloper(true);

    try {
      const [RazorpayCheckout, orderResponse] = await Promise.all([
        loadRazorpayCheckout(),
        createDeveloperModeOrder(accessToken),
      ]);

      if (orderResponse.data?.alreadyUnlocked) {
        if (modeAccess.currentMode === PLATFORM_MODES.DEVELOPER) {
          setFeedback({
            type: "success",
            message: "Developer Mode is already unlocked and active for this account.",
          });
          return;
        }
        await handleModeSwitch(PLATFORM_MODES.DEVELOPER);
        return;
      }

      const checkout = orderResponse.data?.checkout;
      if (!checkout?.orderId || !checkout?.key) {
        throw new Error("Developer Mode checkout is not available right now. Please try again shortly.");
      }

      await new Promise((resolve, reject) => {
        const razorpay = new RazorpayCheckout({
          key: checkout.key,
          amount: checkout.amount,
          currency: checkout.currency,
          name: checkout.name,
          description: checkout.description,
          order_id: checkout.orderId,
          notes: checkout.notes,
          prefill: checkout.prefill || {
            name: user?.name || "",
            email: user?.email || "",
          },
          theme: { color: "#cc6f29" },
          modal: {
            ondismiss: () => reject(new Error("Developer Mode payment was cancelled before completion.")),
          },
          handler: async (response) => {
            try {
              await verifyDeveloperModePayment(accessToken, {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
              await refreshProfile();
              setSettings((current) => ({
                ...current,
                currentMode: PLATFORM_MODES.DEVELOPER,
              }));
              setFeedback({
                type: "success",
                message: "Developer Mode unlocked successfully. You can now publish and sell PDFs publicly.",
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          },
        });

        razorpay.open();
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to unlock Developer Mode right now.",
      });
    } finally {
      setIsUnlockingDeveloper(false);
    }
  }

  if (!user) {
    return <LoadingCard message="Loading account settings..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Settings"
        title="Account settings and mode access"
        description="Control notifications, keep your current mode clear, and upgrade into Developer Mode only when you need marketplace selling tools."
      />

      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}

      <section className="stack-section" id="mode-access">
        <SectionHeader
          eyebrow="3-mode system"
          title="Choose the right ExamNova path"
          description="Simple Mode stays public. Logged-in accounts start in Professional Mode, and Developer Mode adds public selling after a one-time Rs. 10 unlock."
        />
        <article className="detail-card mode-status-summary">
          <div className="mode-card-header">
            <div>
              <p className="eyebrow">Developer unlock status</p>
              <h3>{modeAccess.developerUnlocked ? "Payment verified" : "Locked until payment"}</h3>
            </div>
            <span className={`status-chip ${modeAccess.developerUnlocked ? "" : "muted"}`}>
              <i className={`bi ${modeAccess.developerUnlocked ? "bi-shield-check" : "bi-lock-fill"}`} />
              {modeAccess.developerUnlocked
                ? "Developer access ready"
                : `Rs. ${modeAccess.developerUnlockAmountInr} required`}
            </span>
          </div>
          <div className="info-grid">
            <div>
              <span className="info-label">Current mode</span>
              <strong>{MODE_LABELS[modeAccess.currentMode]}</strong>
            </div>
            <div>
              <span className="info-label">Unlock status</span>
              <strong>{modeAccess.developerUnlocked ? "Unlocked" : "Not unlocked yet"}</strong>
            </div>
            <div>
              <span className="info-label">Unlocked on</span>
              <strong>{developerUnlockedAtLabel || "Payment not completed yet"}</strong>
            </div>
            <div>
              <span className="info-label">Verification record</span>
              <strong>{modeAccess.developerUnlockPaymentId ? "Stored in backend profile" : "Will be stored after payment"}</strong>
            </div>
          </div>
        </article>
        <div className="mode-grid">
          {MODE_CATALOG.map((mode) => {
            const isCurrent = mode.id === modeAccess.currentMode;
            const isDeveloper = mode.id === PLATFORM_MODES.DEVELOPER;
            const isAvailable = mode.id === PLATFORM_MODES.SIMPLE || modeAccess.availableModes.includes(mode.id);

            return (
              <article
                className={`detail-card mode-card ${isCurrent ? "current" : ""} ${isDeveloper ? "developer" : ""}`}
                key={mode.id}
              >
                <div className="mode-card-header">
                  <div>
                    <p className="eyebrow">{mode.badge}</p>
                    <h3>{mode.label}</h3>
                  </div>
                  {isCurrent ? <span className="status-chip"><i className="bi bi-stars" />Current</span> : null}
                </div>
                <p className="support-copy">{mode.description}</p>
                <div className="mode-feature-list">
                  {mode.features.map((feature) => (
                    <span className="mode-feature-item" key={feature}>
                      <i className="bi bi-check2-circle" />
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="hero-actions">
                  {mode.id === PLATFORM_MODES.SIMPLE ? (
                    <Link className="button ghost" to="/marketplace">
                      <i className="bi bi-shop" />
                      Open public marketplace
                    </Link>
                  ) : isDeveloper ? (
                    modeAccess.developerUnlocked ? (
                      <button
                        className={isCurrent ? "button secondary" : "button primary"}
                        disabled={isSaving || isCurrent}
                        onClick={() => handleModeSwitch(PLATFORM_MODES.DEVELOPER)}
                        type="button"
                      >
                        <i className={`bi ${isCurrent ? "bi-check2-circle" : "bi-lightning-charge-fill"}`} />
                        {isCurrent ? "Developer Mode active" : "Switch to Developer Mode"}
                      </button>
                    ) : (
                      <button
                        className="button primary"
                        disabled={isUnlockingDeveloper}
                        onClick={handleUnlockDeveloperMode}
                        type="button"
                      >
                        <i className="bi bi-lightning-charge-fill" />
                        {isUnlockingDeveloper
                          ? "Opening checkout..."
                          : `Unlock Developer Mode for Rs. ${modeAccess.developerUnlockAmountInr}`}
                      </button>
                    )
                  ) : (
                    <button
                      className={isCurrent ? "button secondary" : "button primary"}
                      disabled={isSaving || isCurrent || !isAvailable}
                      onClick={() => handleModeSwitch(PLATFORM_MODES.PROFESSIONAL)}
                      type="button"
                    >
                      <i className={`bi ${isCurrent ? "bi-check2-circle" : "bi-person-badge-fill"}`} />
                      {isCurrent ? "Professional Mode active" : "Use Professional Mode"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <form className="detail-card settings-form" onSubmit={handleSubmit}>
        <SectionHeader
          eyebrow="Notifications"
          title="Communication preferences"
          description="These settings stay with your account no matter which logged-in mode you use."
        />
        <FormSwitchRow
          label="Email notifications"
          description="Receive important account and purchase notifications by email."
          checked={settings.emailNotifications}
          name="emailNotifications"
          onChange={(event) => setSettings((current) => ({ ...current, emailNotifications: event.target.checked }))}
        />
        <FormSwitchRow
          label="Product updates"
          description="Get updates about new features and improvements in ExamNova AI."
          checked={settings.productUpdates}
          name="productUpdates"
          onChange={(event) => setSettings((current) => ({ ...current, productUpdates: event.target.checked }))}
        />
        <FormSwitchRow
          label="Marketplace alerts"
          description="Be notified when new marketplace opportunities and releases match your interests."
          checked={settings.marketplaceAlerts}
          name="marketplaceAlerts"
          onChange={(event) => setSettings((current) => ({ ...current, marketplaceAlerts: event.target.checked }))}
        />
        <button className="button primary" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save settings"}
        </button>
      </form>

      <div className="two-column-grid">
        <EmptyStateCard
          title="Security"
          description="Password change history, device sessions, and login security tools will be added in a later phase."
        />
        <EmptyStateCard
          title="Seller controls"
          description={
            modeAccess.developerUnlocked
              ? "Developer Mode is unlocked. Use Listed PDFs, Wallet, and Withdrawals when you want to work as a marketplace seller."
              : "Developer-only seller controls stay hidden until you unlock Developer Mode from the section above."
          }
        />
      </div>
    </section>
  );
}
