import { useEffect, useState } from "react";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  fetchAdminUser,
  fetchAdminUsers,
  updateAdminUserStatus,
} from "../../services/api/index.js";

export function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setIsLoading(true);
      try {
        const query = search ? `search=${encodeURIComponent(search)}` : "";
        const response = await fetchAdminUsers(accessToken, query);
        if (active) {
          setItems(response.data.items);
        }
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load users." });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (accessToken) {
      loadUsers();
    }

    return () => {
      active = false;
    };
  }, [accessToken, search]);

  async function handleSelect(userId) {
    try {
      const response = await fetchAdminUser(accessToken, userId);
      setSelectedUser(response.data);
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to load user detail." });
    }
  }

  async function handleUserAction(userId, action) {
    try {
      const response = await updateAdminUserStatus(accessToken, userId, { action });
      setItems((current) => current.map((item) => (item.id === userId ? response.data.user : item)));
      if (selectedUser?.user?.id === userId) {
        setSelectedUser((current) => current ? { ...current, user: response.data.user } : current);
      }
      setFeedback({ type: "success", message: `User ${action} action completed successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to update user status." });
    }
  }

  if (isLoading) {
    return <LoadingCard message="Loading admin users..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Admin users"
        title="User management"
        description="Inspect account status, verification state, and block or unblock users when operational intervention is needed."
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}
      <label className="field">
        <span>Search users</span>
        <input className="input" onChange={(event) => setSearch(event.target.value)} value={search} />
      </label>
      <div className="two-column-grid admin-grid">
        <section className="detail-card">
          <div className="activity-list">
            {items.map((item) => (
              <article className="activity-item" key={item.id}>
                <strong>{item.name}</strong>
                <span className="support-copy">{item.email}</span>
                <div className="topbar-chip-group">
                  <StatusBadge tone={item.isBlocked ? "danger" : "success"}>{item.status}</StatusBadge>
                  <StatusBadge tone={item.isEmailVerified ? "success" : "warning"}>
                    {item.isEmailVerified ? "verified" : "unverified"}
                  </StatusBadge>
                </div>
                <div className="hero-actions">
                  <button className="button ghost" onClick={() => handleSelect(item.id)} type="button">
                    Inspect
                  </button>
                  {item.isBlocked ? (
                    <button className="button secondary" onClick={() => handleUserAction(item.id, "unblock")} type="button">
                      Unblock
                    </button>
                  ) : (
                    <button className="button ghost danger" onClick={() => handleUserAction(item.id, "block")} type="button">
                      Block
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="detail-card">
          <SectionHeader
            eyebrow="Selected user"
            title={selectedUser?.user?.name || "Choose a user"}
            description="See profile and high-level account metrics before taking an admin action."
          />
          {selectedUser ? (
            <div className="info-grid">
              <div><span className="info-label">Email</span><strong>{selectedUser.user.email}</strong></div>
              <div><span className="info-label">Role</span><strong>{selectedUser.user.role}</strong></div>
              <div><span className="info-label">Status</span><strong>{selectedUser.user.status}</strong></div>
              <div><span className="info-label">Generated PDFs</span><strong>{selectedUser.stats.generatedPdfs}</strong></div>
              <div><span className="info-label">Listings</span><strong>{selectedUser.stats.listings}</strong></div>
              <div><span className="info-label">Purchases</span><strong>{selectedUser.stats.purchases}</strong></div>
              <div><span className="info-label">Available balance</span><strong>Rs. {selectedUser.stats.availableBalance}</strong></div>
              <div><span className="info-label">Last login</span><strong>{selectedUser.user.lastLoginAt ? new Date(selectedUser.user.lastLoginAt).toLocaleString() : "N/A"}</strong></div>
            </div>
          ) : (
            <p className="support-copy">Select a user from the list to inspect their account.</p>
          )}
        </section>
      </div>
    </section>
  );
}
