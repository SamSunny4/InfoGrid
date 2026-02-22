"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

interface FetchedArticle {
  source: { name: string };
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
}

const EMPTY_FORM = { title: "", description: "" };

export default function NewsPage() {
  // ── existing news state ──────────────────────────────────────────────
  const [items, setItems]               = useState<NewsItem[]>([]);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [refresh, setRefresh]           = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── auto-fetch state ─────────────────────────────────────────────────
  const [fetchOpen, setFetchOpen]             = useState(false);
  const [fetchQuery, setFetchQuery]           = useState("artificial intelligence");
  const [fetching, setFetching]               = useState(false);
  const [fetchError, setFetchError]           = useState("");
  const [articles, setArticles]               = useState<FetchedArticle[]>([]);
  const [addingIdx, setAddingIdx]             = useState<number | null>(null);
  const [addedIdxs, setAddedIdxs]             = useState<Set<number>>(new Set());
  // Review modal
  const [reviewArticle, setReviewArticle]     = useState<FetchedArticle | null>(null);
  const [reviewIdx, setReviewIdx]             = useState<number | null>(null);
  const [reviewTitle, setReviewTitle]         = useState("");
  const [reviewDesc, setReviewDesc]           = useState("");
  const [reviewSaving, setReviewSaving]       = useState(false);
  const [reviewError, setReviewError]         = useState("");

  const triggerRefresh = () => setRefresh((n) => n + 1);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((json: { success: boolean; data: NewsItem[] }) => {
        if (json.success) setItems(json.data);
      });
  }, [refresh]);

  // ── manual form handlers ─────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleEdit = (item: NewsItem) => {
    setEditingId(item._id);
    setForm({ title: item.title, description: item.description });
    setImagePreview(item.imageUrl);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this news item?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    triggerRefresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    if (imageFile) fd.append("image", imageFile);
    const url    = editingId ? `/api/news/${editingId}` : "/api/news";
    const method = editingId ? "PUT" : "POST";
    const res    = await fetch(url, { method, body: fd });
    const json   = await res.json();
    setLoading(false);
    if (!json.success) { setError(json.message); return; }
    triggerRefresh();
    resetForm();
  };

  // ── auto-fetch handlers ──────────────────────────────────────────────
  const handleFetch = async () => {
    if (!fetchQuery.trim()) return;
    setFetching(true);
    setFetchError("");
    setArticles([]);
    setAddedIdxs(new Set());
    try {
      const res  = await fetch(`/api/admin/fetch-news?q=${encodeURIComponent(fetchQuery)}&pageSize=12`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFetchError(data.error ?? "Failed to fetch articles.");
      } else {
        setArticles(data.articles);
        if (data.articles.length === 0) setFetchError("No articles found for that query.");
      }
    } catch {
      setFetchError("Network error — could not reach the news API.");
    } finally {
      setFetching(false);
    }
  };

  const openReview = (article: FetchedArticle, idx: number) => {
    setReviewArticle(article);
    setReviewIdx(idx);
    setReviewTitle(article.title);
    setReviewDesc(article.description ?? "");
    setReviewError("");
  };

  const closeReview = () => {
    setReviewArticle(null);
    setReviewIdx(null);
    setReviewError("");
  };

  const handleAddFromReview = async () => {
    if (!reviewArticle || reviewIdx === null) return;
    if (!reviewTitle.trim()) { setReviewError("Title is required"); return; }
    if (!reviewDesc.trim())  { setReviewError("Description is required"); return; }

    setReviewSaving(true);
    setReviewError("");
    setAddingIdx(reviewIdx);

    const fd = new FormData();
    fd.append("title", reviewTitle);
    fd.append("description", reviewDesc);
    if (reviewArticle.urlToImage) fd.append("imageSourceUrl", reviewArticle.urlToImage);

    const res  = await fetch("/api/news", { method: "POST", body: fd });
    const json = await res.json();

    setReviewSaving(false);
    setAddingIdx(null);

    if (!json.success) {
      setReviewError(json.message ?? "Failed to save.");
    } else {
      setAddedIdxs((prev) => new Set(prev).add(reviewIdx));
      triggerRefresh();
      closeReview();
    }
  };

  return (
    <div>
      <div className="a-page-header">
        <div className="a-page-title">
          <span className="a-page-title-icon" style={{ background: "var(--a-blue-dim)", color: "var(--a-blue)" }}>◈</span>
          News Management
        </div>
        <p className="a-page-sub">Create, edit and remove news items shown on the display board.</p>
      </div>

      {/* ── Auto-Fetch panel ───────────────────────────────────────────── */}
      <div className="a-card a-section-gap">
        <button
          className="a-fetch-toggle"
          onClick={() => { setFetchOpen((o) => !o); setFetchError(""); }}
        >
          <span className="a-fetch-toggle-icon">✦</span>
          Auto-Fetch from Web
          <span className="a-fetch-toggle-chevron" style={{ transform: fetchOpen ? "rotate(180deg)" : "none" }}>▾</span>
        </button>

        {fetchOpen && (
          <div className="a-fetch-body">
            <p className="a-fetch-hint">
              Search for real news articles and import them directly into InfoGrid. Images are
              automatically downloaded and stored in your R2 bucket.
            </p>

            <div className="a-fetch-search-row">
              <input
                className="a-input a-fetch-search-input"
                type="text"
                placeholder="e.g. artificial intelligence, machine learning…"
                value={fetchQuery}
                onChange={(e) => setFetchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              />
              <button
                className="a-btn a-btn-primary"
                onClick={handleFetch}
                disabled={fetching}
              >
                {fetching ? <><span className="a-spinner" /> Fetching…</> : "Search"}
              </button>
            </div>

            {fetchError && <div className="a-alert-error" style={{ marginTop: 12 }}>{fetchError}</div>}

            {articles.length > 0 && (
              <>
                <p className="a-fetch-results-label">{articles.length} articles found — click a card to review &amp; add</p>
                <div className="a-fetch-grid">
                  {articles.map((article, idx) => {
                    const added   = addedIdxs.has(idx);
                    const adding  = addingIdx === idx;
                    return (
                      <div key={idx} className={`a-fetch-card${added ? " a-fetch-card--added" : ""}`}>
                        <div className="a-fetch-card-img">
                          {article.urlToImage ? (
                            <Image
                              src={article.urlToImage}
                              alt={article.title}
                              fill
                              style={{ objectFit: "cover" }}
                              unoptimized
                            />
                          ) : (
                            <div className="a-fetch-card-no-img">◈</div>
                          )}
                          <span className="a-fetch-card-source">{article.source.name}</span>
                        </div>
                        <div className="a-fetch-card-body">
                          <p className="a-fetch-card-title">{article.title}</p>
                          <p className="a-fetch-card-desc">{article.description}</p>
                        </div>
                        <div className="a-fetch-card-foot">
                          {added ? (
                            <span className="a-fetch-card-added">✓ Added</span>
                          ) : (
                            <button
                              className="a-btn a-btn-primary a-btn-sm"
                              onClick={() => openReview(article, idx)}
                              disabled={adding}
                            >
                              {adding ? <><span className="a-spinner" /> Adding…</> : "Review & Add"}
                            </button>
                          )}
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="a-fetch-card-link"
                          >
                            Source ↗
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Review modal ──────────────────────────────────────────────── */}
      {reviewArticle && (
        <div className="a-modal-overlay" onClick={closeReview}>
          <div className="a-modal" onClick={(e) => e.stopPropagation()}>
            <div className="a-modal-header">
              <span className="a-modal-title">Review Article</span>
              <button className="a-modal-close" onClick={closeReview}>✕</button>
            </div>

            {reviewArticle.urlToImage && (
              <div className="a-modal-img">
                <Image
                  src={reviewArticle.urlToImage}
                  alt={reviewArticle.title}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </div>
            )}

            <div className="a-modal-body">
              <p className="a-modal-source-label">
                {reviewArticle.source.name} — {new Date(reviewArticle.publishedAt).toLocaleDateString()}
              </p>

              <div className="a-field" style={{ marginBottom: 12 }}>
                <label className="a-label">Title <span className="a-required">*</span></label>
                <input
                  className="a-input"
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
              </div>

              <div className="a-field" style={{ marginBottom: 12 }}>
                <label className="a-label">Description <span className="a-required">*</span></label>
                <textarea
                  className="a-textarea"
                  rows={4}
                  value={reviewDesc}
                  onChange={(e) => setReviewDesc(e.target.value)}
                />
              </div>

              {reviewError && <div className="a-alert-error" style={{ marginBottom: 12 }}>{reviewError}</div>}

              <div className="a-btn-row">
                <button
                  className="a-btn a-btn-primary"
                  onClick={handleAddFromReview}
                  disabled={reviewSaving}
                >
                  {reviewSaving ? <><span className="a-spinner" /> Saving…</> : "Confirm & Add to News"}
                </button>
                <button className="a-btn a-btn-ghost" onClick={closeReview}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manual form card ────────────────────────────────────────────── */}
      <div className="a-card a-section-gap">
        <div className="a-card-header">
          <span className="a-card-title">{editingId ? "Edit News Item" : "Add News Item"}</span>
        </div>
        <div className="a-card-body">
          {error && <div className="a-alert-error" style={{ marginBottom: 14 }}>{error}</div>}
          <form onSubmit={handleSubmit} className="a-form">
            <div className="a-field">
              <label className="a-label">Title <span className="a-required">*</span></label>
              <input
                className="a-input"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="News headline"
              />
            </div>
            <div className="a-field">
              <label className="a-label">Description <span className="a-required">*</span></label>
              <textarea
                className="a-textarea"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="News content…"
              />
            </div>
            <div className="a-field">
              <label className="a-label">Image</label>
              <label className="a-file-drop">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
                <div className="a-file-drop-icon">🖼</div>
                <div className="a-file-drop-text">Click to choose an image</div>
                <div className="a-file-drop-hint">PNG, JPG, WEBP — max 10 MB</div>
                {imageFile && <div className="a-file-chosen">✓ {imageFile.name}</div>}
              </label>
              {imagePreview && (
                <div className="a-preview">
                  <Image src={imagePreview} alt="Preview" fill style={{ objectFit: "cover" }} unoptimized />
                </div>
              )}
            </div>
            <div className="a-btn-row">
              <button type="submit" disabled={loading} className="a-btn a-btn-primary">
                {loading ? <><span className="a-spinner" /> Saving…</> : editingId ? "Update" : "Add News"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="a-btn a-btn-ghost">Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── List ── */}
      <p className="a-list-heading">All News ({items.length})</p>
      {items.length === 0 ? (
        <div className="a-empty">
          <div className="a-empty-icon">◈</div>
          <div className="a-empty-text">No news items yet. Add one above.</div>
        </div>
      ) : (
        <div className="a-list">
          {items.map((item) => (
            <div key={item._id} className="a-item">
              {item.imageUrl && (
                <div className="a-item-thumb">
                  <Image src={item.imageUrl} alt={item.title} fill style={{ objectFit: "cover" }} unoptimized />
                </div>
              )}
              <div className="a-item-body">
                <div className="a-item-title">{item.title}</div>
                <div className="a-item-desc">{item.description}</div>
                <div className="a-item-meta">{new Date(item.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="a-item-actions">
                <button onClick={() => handleEdit(item)} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                <button onClick={() => handleDelete(item._id)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
