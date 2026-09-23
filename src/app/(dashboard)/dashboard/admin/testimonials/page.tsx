"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Star, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllTestimonialsAdmin,
  updateTestimonialAdmin,
  setTestimonialFeatured,
  deleteTestimonialAdmin,
  type Testimonial,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import StarRatingInput from "@/components/common/StarRatingInput";

const PAGE_LIMIT = 20;

// Small inline star display -- read-only, unlike StarRatingInput which is
// click-to-rate.
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
      ))}
    </div>
  );
}

function EditTestimonialModal({
  testimonial,
  onClose,
  onSaved,
}: {
  testimonial: Testimonial;
  onClose: () => void;
  onSaved: (updated: Testimonial) => void;
}) {
  const [rating, setRating] = useState(testimonial.rating);
  const [quote, setQuote] = useState(testimonial.quote);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!rating || !quote.trim()) return;
    setIsSaving(true);
    try {
      const result = await updateTestimonialAdmin(testimonial.id, rating, quote.trim());
      toast.success("Testimonial updated");
      onSaved(result.testimonial);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update testimonial.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Edit Testimonial</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Rating</label>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Testimonial</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm resize-none"
            />
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
            disabled={isSaving || !rating || !quote.trim()}
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

export default function AdminTestimonialsPage() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const loadTestimonials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllTestimonialsAdmin({ search: search || undefined, page, limit: PAGE_LIMIT });
      setTestimonials(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load testimonials.");
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "sub_admin") {
      loadTestimonials();
    }
  }, [user, loadTestimonials]);

  if (user && user.role !== "admin" && user.role !== "sub_admin") {
    return <ComingSoon title="Testimonials" />;
  }

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    setActioningId(testimonial.id);
    try {
      const result = await setTestimonialFeatured(testimonial.id, !testimonial.isFeatured);
      toast.success(
        result.isFeatured
          ? "Now showing on the homepage"
          : "Removed from the homepage"
      );
      setTestimonials((prev) =>
        prev.map((t) => (t.id === testimonial.id ? { ...t, isFeatured: result.isFeatured } : t))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update featured status.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActioningId(deleteTarget.id);
    try {
      await deleteTestimonialAdmin(deleteTarget.id);
      toast.success("Testimonial deleted");
      setDeleteTarget(null);
      loadTestimonials();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete testimonial.");
    } finally {
      setActioningId(null);
    }
  };

  const columns: CommonTableColumn<Testimonial>[] = [
    {
      key: "candidate",
      title: "Candidate",
      minWidth: 200,
      render: (_, t) => (
        <span className="font-bold text-foreground">{t.user?.full_name || t.user?.email || "Unknown"}</span>
      ),
    },
    {
      key: "rating",
      title: "Rating",
      minWidth: 110,
      render: (_, t) => <StarDisplay rating={t.rating} />,
    },
    {
      key: "quote",
      title: "Testimonial",
      minWidth: 320,
      render: (_, t) => <span className="text-muted-foreground max-w-md truncate block">{t.quote}</span>,
    },
    {
      key: "featured",
      title: "Featured",
      minWidth: 100,
      render: (_, t) => (
        <button
          title={t.isFeatured ? "Remove from homepage" : "Show on homepage"}
          disabled={actioningId === t.id}
          onClick={() => handleToggleFeatured(t)}
          className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
            t.isFeatured ? "text-amber-500 hover:bg-amber-100" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Star className={`w-4 h-4 ${t.isFeatured ? "fill-amber-400" : ""}`} />
        </button>
      ),
    },
    {
      key: "date",
      title: "Date",
      minWidth: 140,
      render: (_, t) => (
        <span className="text-muted-foreground font-medium">
          {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      minWidth: 100,
      render: (_, t) => (
        <div className="flex items-center justify-end gap-1">
          <button
            title="Edit"
            onClick={() => setEditingTestimonial(t)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            title="Delete"
            onClick={() => setDeleteTarget(t)}
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
        <h1 className="text-2xl font-black text-foreground">Testimonials</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Candidate testimonials about the platform. Feature the ones you want shown on the homepage.
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<Testimonial, string>
        columns={columns}
        data={testimonials}
        rowKey={(t) => t.id}
        loading={isLoading}
        emptyMessage="No testimonials yet."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by candidate name or email..." }}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
      />

      {editingTestimonial && (
        <EditTestimonialModal
          testimonial={editingTestimonial}
          onClose={() => setEditingTestimonial(null)}
          onSaved={(updated) => {
            setTestimonials((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setEditingTestimonial(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Testimonial"
        message={`Permanently delete this testimonial from "${deleteTarget?.user?.full_name || deleteTarget?.user?.email || "this candidate"}"?\n\nThis cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        isConfirming={actioningId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
