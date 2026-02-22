import "./admin.css";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

const navItems = [
  { href: "/admin",         label: "Dashboard", icon: "⊞" },
  { href: "/admin/news",    label: "News",       icon: "◈" },
  { href: "/admin/events",  label: "Events",     icon: "◷" },
  { href: "/admin/posters", label: "Posters",    icon: "⬡" },
  { href: "/admin/qrcodes", label: "QR Codes",   icon: "⊡" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Render bare page for the login route — no sidebar shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // All other /admin pages require an active session
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

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
          <div className="a-sidebar-user">
            <span className="a-sidebar-user-name">{session.username}</span>
            <span className="a-sidebar-user-role">{session.role}</span>
          </div>
          <LogoutButton />
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
