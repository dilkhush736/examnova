import { useEffect, useMemo, useState } from "react";
import { LoadingCard } from "../../components/ui/LoadingCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import {
  SERVICE_CATEGORY_OPTIONS,
  getServiceCategoryLabel,
} from "../../features/marketplace/marketplace.constants.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  createAdminService,
  deleteAdminService,
  fetchAdminServices,
  updateAdminService,
} from "../../services/api/index.js";

function createBlankServiceForm() {
  return {
    title: "",
    category: SERVICE_CATEGORY_OPTIONS[0].value,
    shortDescription: "",
    details: "",
    techStack: "",
    demoUrl: "",
    repoUrl: "",
    priceInr: "2999",
    offerPriceInr: "",
    visibility: "draft",
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
  };
}

function createServiceForm(item = null) {
  if (!item) {
    return createBlankServiceForm();
  }

  return {
    title: item.title || "",
    category: item.category || SERVICE_CATEGORY_OPTIONS[0].value,
    shortDescription: item.shortDescription || "",
    details: item.details || "",
    techStack: (item.techStack || []).join(", "),
    demoUrl: item.demoUrl || "",
    repoUrl: item.repoUrl || "",
    priceInr: String(item.pricing?.basePriceInr || 2999),
    offerPriceInr: item.pricing?.offerPriceInr ? String(item.pricing.offerPriceInr) : "",
    visibility: item.visibility || "draft",
    isFeatured: Boolean(item.isFeatured),
    seoTitle: item.seoTitle || "",
    seoDescription: item.seoDescription || "",
  };
}

function appendServiceFormData(target, source) {
  Object.entries(source).forEach(([key, value]) => {
    target.append(key, typeof value === "boolean" ? String(value) : value);
  });
}

export function AdminServicesPage() {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(createBlankServiceForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [editingId, setEditingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;

    async function loadServices() {
      setIsLoading(true);
      try {
        const response = await fetchAdminServices(accessToken);
        if (active) {
          setItems(response.data.items);
        }
      } catch (error) {
        if (active) {
          setFeedback({ type: "error", message: error.message || "Unable to load website services." });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (accessToken) {
      loadServices();
    }

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreviewUrl("");
      return undefined;
    }

    const objectUrl = window.URL.createObjectURL(selectedImage);
    setImagePreviewUrl(objectUrl);

    return () => window.URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const formTitle = useMemo(
    () => (editingId ? "Edit website service" : "Create website service"),
    [editingId],
  );

  function handleChange(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditingId("");
    setSelectedImage(null);
    setSelectedZipFile(null);
    setCurrentImageUrl("");
    setForm(createBlankServiceForm());
  }

  function startEditing(item) {
    setEditingId(item.id);
    setSelectedImage(null);
    setSelectedZipFile(null);
    setCurrentImageUrl(item.imageUrl || "");
    setForm(createServiceForm(item));
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`Delete "${item.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminService(accessToken, item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) {
        resetForm();
      }
      setFeedback({ type: "success", message: "Website service deleted successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to delete website service." });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = new FormData();
      appendServiceFormData(payload, form);
      if (selectedImage) {
        payload.append("image", selectedImage);
      }
      if (selectedZipFile) {
        payload.append("zipFile", selectedZipFile);
      }

      const response = editingId
        ? await updateAdminService(accessToken, editingId, payload)
        : await createAdminService(accessToken, payload);

      if (editingId) {
        setItems((current) => current.map((item) => (item.id === editingId ? response.data.item : item)));
      } else {
        setItems((current) => [response.data.item, ...current]);
      }

      setFeedback({
        type: "success",
        message: editingId ? "Website service updated successfully." : "Website service created successfully.",
      });
      resetForm();
    } catch (error) {
      setFeedback({ type: "error", message: error.message || "Unable to save website service." });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingCard message="Loading website services..." />;
  }

  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Website services"
        title="Sell portfolio, commercial, and product websites"
        description="Create premium website service cards with demo links, ZIP delivery, pricing offers, and post-purchase repo access."
      />
      {feedback.message ? (
        <p className={feedback.type === "error" ? "form-error" : "form-success"}>{feedback.message}</p>
      ) : null}

      <section className="stack-section admin-uploads-shell">
        <form className="detail-card form-card" onSubmit={handleSubmit}>
          <SectionHeader
            eyebrow={editingId ? "Edit service" : "New service"}
            title={formTitle}
            description="These cards appear inside the marketplace services section and unlock ZIP delivery plus GitHub repo access after payment."
          />

          <label className="field">
            <span>{editingId ? "Replace preview image (optional)" : "Preview image"}</span>
            <input
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="input"
              onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
              required={!editingId}
              type="file"
            />
          </label>

          <label className="field">
            <span>{editingId ? "Replace ZIP package (optional)" : "Website ZIP package"}</span>
            <input
              accept=".zip,application/zip,application/x-zip-compressed"
              className="input"
              onChange={(event) => setSelectedZipFile(event.target.files?.[0] || null)}
              required={!editingId}
              type="file"
            />
          </label>

          {imagePreviewUrl || currentImageUrl ? (
            <figure className="cover-upload-preview">
              <img
                alt={`${form.title || "Website service"} preview`}
                className="cover-upload-preview-image"
                src={imagePreviewUrl || currentImageUrl}
              />
            </figure>
          ) : null}

          <div className="two-column-grid compact">
            <label className="field">
              <span>Website name</span>
              <input className="input" onChange={(event) => handleChange("title", event.target.value)} required value={form.title} />
            </label>
            <label className="field">
              <span>Category</span>
              <select className="input" onChange={(event) => handleChange("category", event.target.value)} value={form.category}>
                {SERVICE_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Base price (Rs.)</span>
              <input className="input" min="99" onChange={(event) => handleChange("priceInr", event.target.value)} type="number" value={form.priceInr} />
            </label>
            <label className="field">
              <span>Offer price (Rs.)</span>
              <input className="input" min="0" onChange={(event) => handleChange("offerPriceInr", event.target.value)} type="number" value={form.offerPriceInr} />
            </label>
            <label className="field">
              <span>Demo link</span>
              <input className="input" onChange={(event) => handleChange("demoUrl", event.target.value)} required value={form.demoUrl} />
            </label>
            <label className="field">
              <span>GitHub repo link</span>
              <input className="input" onChange={(event) => handleChange("repoUrl", event.target.value)} value={form.repoUrl} />
            </label>
            <label className="field">
              <span>Visibility</span>
              <select className="input" onChange={(event) => handleChange("visibility", event.target.value)} value={form.visibility}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unlisted">Unlisted</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="field">
              <span>Tech stack</span>
              <input
                className="input"
                onChange={(event) => handleChange("techStack", event.target.value)}
                placeholder="React, Node.js, MongoDB"
                value={form.techStack}
              />
            </label>
          </div>

          <label className="field">
            <span>Short description</span>
            <textarea className="input" onChange={(event) => handleChange("shortDescription", event.target.value)} required rows={3} value={form.shortDescription} />
          </label>
          <label className="field">
            <span>View in details content</span>
            <textarea className="input" onChange={(event) => handleChange("details", event.target.value)} rows={6} value={form.details} />
          </label>

          <details className="guided-disclosure" open={Boolean(editingId)}>
            <summary>Optional SEO and placement</summary>
            <div className="stack-section">
              <label className="field"><span>SEO title</span><input className="input" onChange={(event) => handleChange("seoTitle", event.target.value)} value={form.seoTitle} /></label>
              <label className="field"><span>SEO description</span><textarea className="input" onChange={(event) => handleChange("seoDescription", event.target.value)} rows={3} value={form.seoDescription} /></label>
              <label className="checkbox-row">
                <input checked={form.isFeatured} onChange={(event) => handleChange("isFeatured", event.target.checked)} type="checkbox" />
                <span>Feature this website service in the marketplace</span>
              </label>
            </div>
          </details>

          <div className="hero-actions">
            <button className="button primary" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : editingId ? "Save changes" : "Create service"}
            </button>
            {editingId ? <button className="button ghost" onClick={resetForm} type="button">Cancel edit</button> : null}
          </div>
        </form>

        <section className="stack-section">
          <SectionHeader
            eyebrow="Service inventory"
            title="Published website products"
            description="Each service card can sell a ZIP package and unlock repo access after successful payment."
          />
          <div className="activity-list">
            {items.map((item) => (
              <article className="activity-item" key={item.id}>
                <strong>{item.title}</strong>
                <span className="support-copy">
                  {getServiceCategoryLabel(item.category)} - Rs. {item.pricing?.currentPriceInr || 0}
                </span>
                <div className="topbar-chip-group">
                  <StatusBadge tone="neutral">{getServiceCategoryLabel(item.category)}</StatusBadge>
                  <StatusBadge tone={item.visibility === "published" ? "success" : "warning"}>{item.visibility}</StatusBadge>
                  {item.pricing?.discountPercent ? <StatusBadge tone="success">{item.pricing.discountPercent}% off</StatusBadge> : null}
                  {item.isFeatured ? <StatusBadge tone="success">Featured</StatusBadge> : null}
                </div>
                <span className="support-copy">
                  ZIP: {item.hasDownloadPackage ? item.zipFileName || "Attached" : "Missing"} | Demo ready
                </span>
                <div className="hero-actions">
                  <button className="button secondary" onClick={() => startEditing(item)} type="button">
                    Edit service
                  </button>
                  <button className="button ghost" onClick={() => handleDelete(item)} type="button">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </section>
  );
}
