"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface EventItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventDate: string;
  eventTime: string;
  eventUrl: string;
  createdAt: string;
}

const EMPTY_FORM = { title: "", description: "", eventDate: "", eventTime: "", eventUrl: "" };

export default function EventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const triggerRefresh = () => setRefresh((n) => n + 1);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((json: { success: boolean; data: EventItem[] }) => {
        if (json.success) setItems(json.data);
      });
  }, [refresh]);

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

  const handleEdit = (item: EventItem) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description,
      eventDate: item.eventDate ? item.eventDate.slice(0, 10) : "",
      eventTime: item.eventTime ?? "",
      eventUrl: item.eventUrl ?? "",
    });
    setImagePreview(item.imageUrl);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
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
    if (form.eventDate) fd.append("eventDate", form.eventDate);
    if (form.eventTime) fd.append("eventTime", form.eventTime);
    if (form.eventUrl)  fd.append("eventUrl", form.eventUrl);
    if (imageFile) fd.append("image", imageFile);

    const url = editingId ? `/api/events/${editingId}` : "/api/events";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, { method, body: fd });
    const json = await res.json();
    setLoading(false);

    if (!json.success) { setError(json.message); return; }
    triggerRefresh();
    resetForm();
  };

  return (
    <div>
      <div className="a-page-header">
        <div className="a-page-title">
          <span className="a-page-title-icon" style={{ background: "var(--a-green-dim)", color: "var(--a-green)" }}>◷</span>
          Events Management
        </div>
        <p className="a-page-sub">Create, edit and remove events shown on the display board.</p>
      </div>

      {/* ── Form card ── */}
      <div className="a-card a-section-gap">
        <div className="a-card-header">
          <span className="a-card-title">{editingId ? "Edit Event" : "Add Event"}</span>
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
                placeholder="Event name"
              />
            </div>
            <div className="a-field">
              <label className="a-label">Description <span className="a-required">*</span></label>
              <textarea
                className="a-textarea"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Event details, venue, speaker…"
              />
            </div>
            <div className="a-form-row">
              <div className="a-field">
                <label className="a-label">Event Date</label>
                <input
                  className="a-input"
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                />
              </div>
              <div className="a-field">
                <label className="a-label">Event Time</label>
                <input
                  className="a-input"
                  type="time"
                  value={form.eventTime}
                  onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                />
              </div>
            </div>
            <div className="a-field">
              <label className="a-label">Event URL</label>
              <input
                className="a-input"
                type="url"
                value={form.eventUrl}
                onChange={(e) => setForm({ ...form, eventUrl: e.target.value })}
                placeholder="https://… (registration / info page)"
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
                {loading ? <><span className="a-spinner" /> Saving…</> : editingId ? "Update" : "Add Event"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="a-btn a-btn-ghost">Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── List ── */}
      <p className="a-list-heading">All Events ({items.length})</p>
      {items.length === 0 ? (
        <div className="a-empty">
          <div className="a-empty-icon">◷</div>
          <div className="a-empty-text">No events yet. Add one above.</div>
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
                <div className="a-item-meta">
                  {item.eventDate && (
                    <span>
                      {new Date(item.eventDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      {item.eventTime && ` · ${item.eventTime}`}
                    </span>
                  )}
                  {item.eventUrl && (
                    <a href={item.eventUrl} target="_blank" rel="noopener noreferrer" className="a-item-link">↗ Info</a>
                  )}
                </div>
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
