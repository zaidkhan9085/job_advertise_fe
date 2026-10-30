"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getSupportMessages,
  updateSupportMessageStatus,
  resolveAllSupportMessages,
  type AdminSupportMessage,
  type SupportMessageStatus,
  type PaginatedMeta,
  ApiError,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { StatusFilterPills } from "@/components/dashboard/StatusFilterPills";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";

const PAGE_LIMIT = 20;

const STATUS_STYLES: Record<SupportMessageStatus, string> = {
  NEW: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  RESOLVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const FILTER_OPTIONS = ["ALL", "NEW", "IN_PROGRESS", "RESOLVED"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function AdminSupportPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminSupportMessage[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterOption>("NEW");
  const [page, setPage] = useState(1);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [showResolveAllConfirm, setShowResolveAllConfirm] = useState(false);
  const [isResolvingAll, setIsResolvingAll] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter === "ALL" ? undefined : (statusFilter as SupportMessageStatus),
    }),
    [search, statusFilter]
  );

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSupportMessages({ ...filters, page, limit: PAGE_LIMIT });
      setMessages(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load support messages.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "sub_admin") {
      loadMessages();
    }
  }, [user, loadMessages]);

  if (user && user.role !== "admin" && user.role !== "sub_admin") {
    return <ComingSoon title="Support" />;
  }

  const handleUpdate = async (id: string, status: SupportMessageStatus) => {
    setActioningId(id);
    try {
      await updateSupportMessageStatus(id, status);
      toast.success(`Marked ${status.replace("_", " ").toLowerCase()}`);
      loadMessages();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update message.");
    } finally {
      setActioningId(null);
    }
  };

  const handleResolveAll = async () => {
    setIsResolvingAll(true);
    try {
      const result = await resolveAllSupportMessages();
      toast.success(result.message);
      setShowResolveAllConfirm(false);
      loadMessages();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to resolve all messages.");
    } finally {
      setIsResolvingAll(false);
    }
  };

  const columns: CommonTableColumn<AdminSupportMessage>[] = [
    {
      key: "subject",
      title: "Subject",
      minWidth: 180,
      render: (_, m) => <span className="text-foreground font-bold">{m.subject}</span>,
    },
    {
      key: "message",
      title: "Message",
      minWidth: 260,
      render: (_, m) => <span className="text-muted-foreground max-w-md truncate block">{m.message}</span>,
    },
    {
      key: "sender",
      title: "From",
      minWidth: 180,
      render: (_, m) => (
        <div>
          <span className="text-foreground font-medium block">{m.sender.full_name || m.sender.email}</span>
          <span className="text-xs text-muted-foreground capitalize">{m.sender.role}</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      minWidth: 130,
      render: (_, m) => <StatusBadge status={m.status} styles={STATUS_STYLES} />,
    },
    {
      key: "date",
      title: "Date",
      minWidth: 140,
      render: (_, m) => (
        <span className="text-muted-foreground font-medium">
          {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      minWidth: 180,
      render: (_, m) => (
        <div className="flex items-center justify-end gap-1.5">
          {m.status !== "IN_PROGRESS" && (
            <button
              disabled={actioningId === m.id}
              onClick={() => handleUpdate(m.id, "IN_PROGRESS")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-blue/10 text-brand-blue transition-colors disabled:opacity-30"
            >
              {actioningId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "In Progress"}
            </button>
          )}
          {m.status !== "RESOLVED" && (
            <button
              disabled={actioningId === m.id}
              onClick={() => handleUpdate(m.id, "RESOLVED")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 text-emerald-600 transition-colors disabled:opacity-30"
            >
              {actioningId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Resolve"}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-foreground">Support</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Messages sent in-app by candidates and employers.</p>
        </div>
        <button
          onClick={() => setShowResolveAllConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
        >
          <CheckCheck className="w-4 h-4" /> Resolve All
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<AdminSupportMessage, string>
        columns={columns}
        data={messages}
        rowKey={(m) => m.id}
        loading={isLoading}
        emptyMessage="No support messages found."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by subject or message..." }}
        filters={<StatusFilterPills options={FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />}
        resetFilters={{
          onReset: () => {
            setSearchInput("");
            setStatusFilter("NEW");
          },
          hasActiveFilters: !!searchInput || statusFilter !== "NEW",
        }}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
      />

      <ConfirmDialog
        isOpen={showResolveAllConfirm}
        title="Resolve All Messages?"
        message="This marks every New and In Progress message as Resolved, across the whole inbox -- not just what's currently filtered or shown on this page."
        confirmLabel="Resolve All"
        isConfirming={isResolvingAll}
        onConfirm={handleResolveAll}
        onCancel={() => setShowResolveAllConfirm(false)}
      />
    </div>
  );
}
