import { useEffect, useState } from "react";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { FormSwitchRow } from "../../components/ui/FormSwitchRow.jsx";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export function AccountSettingsPage() {
  const { user, updateSettings } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    productUpdates: true,
    marketplaceAlerts: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    setSettings({
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      productUpdates: user?.preferences?.productUpdates ?? true,
      marketplaceAlerts: user?.preferences?.marketplaceAlerts ?? true,
    });
  }, [user]);

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

  if (!user) {
    return <LoadingCard message="Loading account settings..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Settings"
        title="Account settings"
        description="Manage your communication preferences and prepare your account for future payout and security modules."
      />
      <form className="detail-card settings-form" onSubmit={handleSubmit}>
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
        {feedback.message ? (
          <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
        ) : null}
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
          title="Payout setup"
          description="Bank and payout preferences will appear here before withdrawal workflows go live."
        />
      </div>
    </section>
  );
}
