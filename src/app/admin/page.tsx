import Link from "next/link";

const sections = [
  {
    href: "/admin/news",
    title: "News",
    description: "Manage news articles with titles, descriptions, and cover images.",
    icon: "◈",
    colorClass: "a-color-blue",
  },
  {
    href: "/admin/events",
    title: "Events",
    description: "Create and manage upcoming events with details and imagery.",
    icon: "◷",
    colorClass: "a-color-green",
  },
  {
    href: "/admin/posters",
    title: "Posters",
    description: "Upload posters shown in the carousel on the display board.",
    icon: "⬡",
    colorClass: "a-color-purple",
  },
  {
    href: "/admin/qrcodes",
    title: "QR Codes",
    description: "Add titled QR codes for easy scanning on the display board.",
    icon: "⊡",
    colorClass: "a-color-orange",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      {/* Welcome banner */}
      <div className="a-dashboard-welcome">
        <div className="a-dashboard-welcome-emoji">⚡</div>
        <div className="a-dashboard-welcome-text">
          <h2>Welcome back</h2>
          <p>Manage everything displayed on the InfoGrid board from here.</p>
        </div>
      </div>

      <p className="a-section-heading">Content Sections</p>

      <div className="a-grid-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className={`a-dash-card ${s.colorClass}`}>
            <div className="a-dash-card-icon">{s.icon}</div>
            <div>
              <div className="a-dash-card-title">{s.title}</div>
              <div className="a-dash-card-desc">{s.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
