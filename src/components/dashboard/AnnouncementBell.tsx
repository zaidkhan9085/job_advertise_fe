"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getActiveAnnouncements, dismissAnnouncement, type Announcement } from "@/lib/api";
import AnnouncementContent from "@/components/common/AnnouncementContent";

// "Seen" (badge-cleared) is a lighter concept than "dismissed" (removed from
// the list server-side, see handleDismiss below) -- it's purely a per-browser
// convenience so a refresh doesn't resurrect the badge for something you
// already opened, so it lives in localStorage rather than the DB. Keyed per
// user id so a shared browser doesn't leak one account's seen-state into
// another's.
function seenStorageKey(userId: number) {
  return `jobs4u_seen_announcements_${userId}`;
}

function readSeenIds(userId: number): Set<string> {
  try {
    const raw = localStorage.getItem(seenStorageKey(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markSeen(userId: number, ids: string[]) {
  try {
    const seen = readSeenIds(userId);
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(seenStorageKey(userId), JSON.stringify([...seen]));
  } catch {
    // Private window / blocked storage -- badge just won't persist across a
    // refresh there, not worth failing anything over.
  }
}

// Mirrors RowActionsMenu's own click-outside-to-close dropdown pattern
// (this codebase's closest existing header-icon-dropdown), not the
// hover-based NavPanelTrigger used on the public nav -- a notification bell
// should only open on a deliberate click.
export default function AnnouncementBell() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetched once per dashboard session, not polled -- this is meant to read
  // as a normal in-app notification, not a real-time push feed.
  useEffect(() => {
    if (!user) return;
    getActiveAnnouncements()
      .then((r) => {
        setAnnouncements(r.announcements);
        const seen = readSeenIds(user.id);
        setUnseenCount(r.announcements.filter((a) => !seen.has(a.id)).length);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleDismiss = (id: string) => {
    // Optimistic -- removing a read notice should feel instant; a failed
    // dismiss just means it reappears on the next real reload, no real harm.
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    dismissAnnouncement(id).catch(() => {});
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          if (user && announcements.length > 0) {
            markSeen(user.id, announcements.map((a) => a.id));
            setUnseenCount(0);
          }
        }}
        aria-label="Announcements"
        className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-4 text-center ring-2 ring-white">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-20 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/60 bg-white shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60">
            <p className="text-sm font-black text-foreground">Announcements</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {announcements.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">You&apos;re all caught up.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="flex items-start gap-2 px-4 py-3 border-b border-border/40 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <AnnouncementContent
                      title={a.title}
                      message={a.message}
                      buttonText={a.buttonText}
                      buttonLink={a.buttonLink}
                    />
                  </div>
                  <button
                    type="button"
                    title="Dismiss"
                    onClick={() => handleDismiss(a.id)}
                    className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
