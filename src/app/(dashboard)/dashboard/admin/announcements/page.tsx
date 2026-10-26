"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Megaphone, Pencil, Trash2, X, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllAnnouncementsAdmin,
  createAnnouncementAdmin,
  updateAnnouncementAdmin,
  setAnnouncementPublished,
  deleteAnnouncementAdmin,
  type Announcement,
  type AnnouncementAudience,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import AnnouncementContent from "@/components/common/AnnouncementContent";
import { buttonClass, inputClass } from "@/lib/ui";

const PAGE_LIMIT = 20;

const AUDIENCE_OPTIONS: { value: AnnouncementAudience; label: string }[] = [
  { value: "all", label: "Employers and Candidates" },
  { value: "candidate", label: "Candidates only" },
  { value: "employer", label: "Employers only" },
];

const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  candidate: "Candidates",
  employer: "Employers",
  all: "Both",
};

// HTML <input type="datetime-local"> wants/returns "YYYY-MM-DDTHH:mm" in the
// viewer's own local time, with no timezone info. `new Date(thatString)`
// correctly parses it as local time, so converting straight to ISO here
// (not sending the raw local string) bakes in the admin's own timezone as
// the intended moment -- the server (which may run in a different TZ)
// then has an unambiguous instant instead of re-interpreting "14:00" as its
// own local time.
function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoOrUndefined(localValue: string): string | undefined {
  if (!localValue) return undefined;
  return new Date(localValue).toISOString();
}

function statusOf(a: Announcement): { label: string; className: string } {
  if (!a.isPublished) return { label: "Draft", className: "bg-secondary text-muted-foreground" };
  const now = new Date();
  if (new Date(a.startsAt) > now) return { label: "Scheduled", className: "bg-amber-50 text-amber-700" };
  if (a.endsAt && new Date(a.endsAt) < now) return { label: "Expired", className: "bg-rose-50 text-rose-600" };
  return { label: "Active", className: "bg-emerald-50 text-emerald-700" };
}

interface FormState {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  buttonText: string;
  buttonLink: string;
  startsAt: string;
  endsAt: string;
  isPublished: boolean;
}

function emptyForm(): FormState {
  return {
    title: "",
    message: "",
    audience: "all",
    buttonText: "",
    buttonLink: "",
    startsAt: toDatetimeLocalValue(new Date().toISOString()),
    endsAt: "",
    isPublished: true,
  };
}

function formFromAnnouncement(a: Announcement): FormState {
  return {
    title: a.title,
    message: a.message,
    audience: a.audience,
    buttonText: a.buttonText || "",
    buttonLink: a.buttonLink || "",
    startsAt: toDatetimeLocalValue(a.startsAt),
    endsAt: toDatetimeLocalValue(a.endsAt),
    isPublished: a.isPublished,
  };
}

// Same hand-rolled pill-switch markup as the AI Scans pause toggle -- no
// shared <Switch> component exists in this codebase.
function PublishToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-brand-blue" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function EditAnnouncementModal({
  announcement,
  onClose,
  onSaved,
}: {
  announcement: Announcement;
  onClose: () => void;
  onSaved: (updated: Announcement) => void;
}) {
  const [form, setForm] = useState<FormState>(() => formFromAnnouncement(announcement));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setIsSaving(true);
    try {
      const result = await updateAnnouncementAdmin(announcement.id, {
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        buttonText: form.buttonText.trim() || undefined,
        buttonLink: form.buttonLink.trim() || undefined,
        startsAt: toIsoOrUndefined(form.startsAt),
        endsAt: toIsoOrUndefined(form.endsAt),
      });
      toast.success("Announcement updated");
      onSaved(result.announcement);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Edit Announcement</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Announcement title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={120}
              className={inputClass({ variant: "outline" })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              maxLength={500}
              rows={4}
              className={inputClass({ variant: "outline" }, "resize-none")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Show to</label>
              <select
                value={form.audience}
                onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as AnnouncementAudience }))}
                className={inputClass({ variant: "outline" })}
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Button text</label>
              <input
                value={form.buttonText}
                onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                placeholder="Explore the update"
                className={inputClass({ variant: "outline" })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Button link</label>
            <input
              value={form.buttonLink}
              onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))}
              placeholder="https://example.com or /jobs"
              className={inputClass({ variant: "outline" })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Starts</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                className={inputClass({ variant: "outline" })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Ends (optional)</label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                className={inputClass({ variant: "outline" })}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl border border-border/60 text-foreground font-bold hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !form.title.trim() || !form.message.trim()}
            className="flex-1 py-3 rounded-xl text-white font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllAnnouncementsAdmin({ search: search || undefined, page, limit: PAGE_LIMIT });
      setAnnouncements(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load announcements.");
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadAnnouncements();
    }
  }, [user, loadAnnouncements]);

  if (user && user.role !== "admin") {
    return <ComingSoon title="Announcements" />;
  }

  const handlePublish = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setIsPublishing(true);
    try {
      await createAnnouncementAdmin({
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        buttonText: form.buttonText.trim() || undefined,
        buttonLink: form.buttonLink.trim() || undefined,
        startsAt: toIsoOrUndefined(form.startsAt),
        endsAt: toIsoOrUndefined(form.endsAt),
        isPublished: form.isPublished,
      });
      toast.success(form.isPublished ? "Announcement published" : "Announcement saved as draft");
      setForm(emptyForm());
      setPage(1);
      loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create announcement.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleTogglePublished = async (a: Announcement) => {
    setActioningId(a.id);
    try {
      const result = await setAnnouncementPublished(a.id, !a.isPublished);
      setAnnouncements((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, isPublished: result.isPublished } : x))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update publish status.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActioningId(deleteTarget.id);
    try {
      await deleteAnnouncementAdmin(deleteTarget.id);
      toast.success("Announcement deleted");
      setDeleteTarget(null);
      loadAnnouncements();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete announcement.");
    } finally {
      setActioningId(null);
    }
  };

  const columns: CommonTableColumn<Announcement>[] = [
    {
      key: "title",
      title: "Title",
      minWidth: 220,
      render: (_, a) => (
        <div>
          <p className="font-bold text-foreground">{a.title}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary text-muted-foreground">
            {AUDIENCE_LABEL[a.audience]}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      minWidth: 100,
      render: (_, a) => {
        const s = statusOf(a);
        return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.className}`}>{s.label}</span>;
      },
    },
    {
      key: "dates",
      title: "Starts / Ends",
      minWidth: 200,
      render: (_, a) => (
        <span className="text-muted-foreground font-medium text-xs">
          {formatDistanceToNow(new Date(a.startsAt), { addSuffix: true })}
          {a.endsAt ? ` → ${formatDistanceToNow(new Date(a.endsAt), { addSuffix: true })}` : ""}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      minWidth: 140,
      render: (_, a) => (
        <div className="flex items-center justify-end gap-1">
          <PublishToggle checked={a.isPublished} onChange={() => handleTogglePublished(a)} />
          <button
            title="Edit"
            onClick={() => setEditingAnnouncement(a)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            title="Delete"
            onClick={() => setDeleteTarget(a)}
            className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-brand-blue" />
          Dashboard Announcements
        </h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Send a message to employer dashboards, candidate dashboards, or both. Button text and destination are fully editable.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">Announcement title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Our new website is live"
            maxLength={120}
            className={inputClass({ variant: "outline" })}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{form.title.length}/120</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Write the message users will see on their dashboard."
            maxLength={500}
            rows={4}
            className={inputClass({ variant: "outline" }, "resize-none")}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">{form.message.length}/500</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Show to</label>
            <select
              value={form.audience}
              onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value as AnnouncementAudience }))}
              className={inputClass({ variant: "outline" })}
            >
              {AUDIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Button text (optional)</label>
            <input
              value={form.buttonText}
              onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
              placeholder="Explore the update"
              className={inputClass({ variant: "outline" })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-1.5">Button link (optional)</label>
          <input
            value={form.buttonLink}
            onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))}
            placeholder="https://example.com or /jobs"
            className={inputClass({ variant: "outline" })}
          />
          <p className="text-xs text-muted-foreground mt-1">Secure website links and internal page links are supported.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Starts</label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              className={inputClass({ variant: "outline" })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Ends (optional)</label>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              className={inputClass({ variant: "outline" })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-bold text-foreground">Publish announcement</p>
            <p className="text-xs text-muted-foreground">Show it during the selected date range</p>
          </div>
          <PublishToggle checked={form.isPublished} onChange={(v) => setForm((f) => ({ ...f, isPublished: v }))} />
        </div>

        <div className="rounded-2xl border border-brand-blue/30 bg-brand-blue-muted/40 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-brand-blue mb-2">Preview</p>
          <AnnouncementContent
            title={form.title}
            message={form.message}
            buttonText={form.buttonText}
            buttonLink={form.buttonLink}
          />
        </div>

        <button
          onClick={handlePublish}
          disabled={isPublishing || !form.title.trim() || !form.message.trim()}
          className={buttonClass({ variant: "primary" }, "w-full sm:w-auto")}
        >
          {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Publish Announcement
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <div>
        <h2 className="text-lg font-black text-foreground">All Announcements</h2>
        <p className="text-muted-foreground text-sm font-medium mb-3">Edit, publish, hide, or remove dashboard messages.</p>
        <CommonTable<Announcement, string>
          columns={columns}
          data={announcements}
          rowKey={(a) => a.id}
          loading={isLoading}
          emptyMessage="No announcements yet."
          search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by title..." }}
          pagination={
            meta
              ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
              : undefined
          }
        />
      </div>

      {editingAnnouncement && (
        <EditAnnouncementModal
          announcement={editingAnnouncement}
          onClose={() => setEditingAnnouncement(null)}
          onSaved={(updated) => {
            setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setEditingAnnouncement(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Announcement"
        message={`Permanently delete "${deleteTarget?.title}"?\n\nThis cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        isConfirming={actioningId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
