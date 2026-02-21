"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface QRCodeItem {
  _id: string;
  title: string;
  imageUrl: string;
  createdAt: string;
}

const EMPTY_FORM = { title: "" };

export default function QRCodesPage() {
  const [items, setItems] = useState<QRCodeItem[]>([]);
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
    fetch("/api/qrcodes")
      .then((r) => r.json())
      .then((json: { success: boolean; data: QRCodeItem[] }) => {
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

  const handleEdit = (item: QRCodeItem) => {
    setEditingId(item._id);
    setForm({ title: item.title });
    setImagePreview(item.imageUrl);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this QR code?")) return;
    await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
    triggerRefresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!editingId && !imageFile) { setError("QR image is required"); return; }

    setLoading(true);
    const fd = new FormData();
    fd.append("title", form.title);
    if (imageFile) fd.append("image", imageFile);

    const url = editingId ? `/api/qrcodes/${editingId}` : "/api/qrcodes";
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
          <span className="a-page-title-icon" style={{ background: "var(--a-orange-dim)", color: "var(--a-orange)" }}>⊡</span>
          QR Codes
        </div>
        <p className="a-page-sub">Add titled QR codes for easy scanning on the display board.</p>
      </div>

      {/* ── Form card ── */}
      <div className="a-card a-section-gap">
        <div className="a-card-header">
          <span className="a-card-title">{editingId ? "Edit QR Code" : "Add QR Code"}</span>
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
                placeholder="e.g. Feedback Form, WiFi Password"
              />
            </div>
            <div className="a-field">
              <label className="a-label">
                QR Code Image {!editingId && <span className="a-required">*</span>}
              </label>
              <label className="a-file-drop">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
                <div className="a-file-drop-icon">⊡</div>
                <div className="a-file-drop-text">Click to choose a QR image</div>
                <div className="a-file-drop-hint">PNG, JPG, WEBP — max 10 MB</div>
                {imageFile && <div className="a-file-chosen">✓ {imageFile.name}</div>}
              </label>
              {imagePreview && (
                <div className="a-preview a-preview-sq">
                  <Image src={imagePreview} alt="QR Preview" fill style={{ objectFit: "contain", padding: 8 }} unoptimized />
                </div>
              )}
            </div>
            <div className="a-btn-row">
              <button type="submit" disabled={loading} className="a-btn a-btn-primary">
                {loading ? <><span className="a-spinner" /> Saving…</> : editingId ? "Update" : "Add QR Code"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="a-btn a-btn-ghost">Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── Grid ── */}
      <p className="a-list-heading">All QR Codes ({items.length})</p>
      {items.length === 0 ? (
        <div className="a-empty">
          <div className="a-empty-icon">⊡</div>
          <div className="a-empty-text">No QR codes yet. Add one above.</div>
        </div>
      ) : (
        <div className="a-grid">
          {items.map((item) => (
            <div key={item._id} className="a-grid-card">
              <div className="a-grid-card-thumb a-grid-card-thumb-sq">
                <Image src={item.imageUrl} alt={item.title} fill style={{ objectFit: "contain" }} unoptimized />
              </div>
              <div className="a-grid-card-footer" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                <span className="a-grid-card-label">{item.title}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleEdit(item)} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
