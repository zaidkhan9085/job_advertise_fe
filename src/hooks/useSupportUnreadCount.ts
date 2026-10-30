"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSupportUnreadCount } from "@/lib/api";

// Sidebar badge for admin/sub_admin's "Support" link -- fetched once per
// dashboard session (same as AnnouncementBell), not polled; the badge
// naturally clears itself once admin moves a message off NEW, since the
// count comes straight from the DB rather than per-browser "seen" state.
export function useSupportUnreadCount(): number {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (user?.role !== "admin" && user?.role !== "sub_admin") return;
    getSupportUnreadCount()
      .then((r) => setCount(r.count))
      .catch(() => {});
  }, [user]);

  return count;
}
