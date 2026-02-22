"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      className="a-logout-btn"
      onClick={handleLogout}
      disabled={loading}
      title="Sign out"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
