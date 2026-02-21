"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface PosterItem {
  _id: string;
  imageUrl: string;
  createdAt: string;
}

export default function PostersPage() {
  const [items, setItems] = useState<PosterItem[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const triggerRefresh = () => setRefresh((n) => n + 1);

  useEffect(() => {
    fetch("/api/posters")
      .then((r) => r.json())
      .then((json: { success: boolean; data: PosterItem[] }) => {
        if (json.success) setItems(json.data);
      });
  }, [refresh]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this poster?")) return;
    await fetch(`/api/posters/${id}`, { method: "DELETE" });
    triggerRefresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!imageFile) { setError("Please select a poster image"); return; }

    setLoading(true);
    const fd = new FormData();
    fd.append("image", imageFile);

    const res = await fetch("/api/posters", { method: "POST", body: fd });
    const json = await res.json();
    setLoading(false);

    if (!json.success) { setError(json.message); return; }

    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
    triggerRefresh();
  };

  return (
    <div>
      <div className="a-page-header">
        <div className="a-page-title">
          <span className="a-page-title-icon" style={{ background: "var(--a-purple-dim)", color: "var(--a-purple)" }}>⬡</span>
          Posters
        </div>
        <p className="a-page-sub">Upload poster images displayed in the board&apos;s carousel.</p>
      </div>

      {/* ── Upload card ── */}
      <div className="a-card a-section-gap">
        <div className="a-card-header">
          <span className="a-card-title">Upload Poster</span>
        </div>
        <div className="a-card-body">
          {error && <div className="a-alert-error" style={{ marginBottom: 14 }}>{error}</div>}
          <form onSubmit={handleSubmit} className="a-form">
            <div className="a-field">
              <label className="a-label">Poster Image <span className="a-required">*</span></label>
              <label className="a-file-drop">
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
                <div className="a-file-drop-icon">⬡</div>
                <div className="a-file-drop-text">Click to choose a poster</div>
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
                {loading ? <><span className="a-spinner" /> Uploading…</> : "Upload Poster"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Grid ── */}
      <p className="a-list-heading">Uploaded Posters ({items.length})</p>
      {items.length === 0 ? (
        <div className="a-empty">
          <div className="a-empty-icon">⬡</div>
          <div className="a-empty-text">No posters yet. Upload one above.</div>
        </div>
      ) : (
        <div className="a-grid">
          {items.map((item) => (
            <div key={item._id} className="a-grid-card">
              <div className="a-grid-card-thumb">
                <Image src={item.imageUrl} alt="Poster" fill style={{ objectFit: "cover" }} unoptimized />
              </div>
              <div className="a-grid-card-footer">
                <span className="a-grid-card-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                <button onClick={() => handleDelete(item._id)} className="a-btn a-btn-danger a-btn-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
