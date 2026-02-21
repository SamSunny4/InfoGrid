import "./admin.css";
import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/admin",         label: "Dashboard", icon: "⊞" },
  { href: "/admin/news",    label: "News",       icon: "◈" },
  { href: "/admin/events",  label: "Events",     icon: "◷" },
  { href: "/admin/posters", label: "Posters",    icon: "⬡" },
  { href: "/admin/qrcodes", label: "QR Codes",   icon: "⊡" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root">
      {/* ── Sidebar ───────────────────────────────── */}
      <aside className="a-sidebar">
        <div className="a-brand">
          <div className="a-brand-logo">
            <div className="a-brand-icon">⚡</div>
            <span className="a-brand-name">InfoGrid</span>
          </div>
          <p className="a-brand-sub">Admin Panel</p>
        </div>

        <nav className="a-nav">
          <p className="a-nav-label">Navigation</p>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="a-nav-item">
              <span className="a-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="a-sidebar-footer">
          <Link href="/" className="a-back-link">
            ← Back to Display Board
          </Link>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <main className="a-main">
        <div className="a-content">{children}</div>
      </main>
    </div>
  );
}
