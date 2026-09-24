"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { X, Loader2, Crown, Gift, Settings2, History, Coins } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllSubscriptionsAdmin,
  getEmployerPaymentHistoryAdmin,
  adjustEmployerSubscriptionAdmin,
  giftSubscriptionAdmin,
  ApiError,
  type AdminSubscriptionRow,
  type BillingPayment,
  type PaginatedMeta,
} from "@/lib/api";
import ComingSoon from "@/components/dashboard/ComingSoon";
import CommonTable, { type CommonTableColumn } from "@/components/dashboard/CommonTable";

const PAGE_LIMIT = 20;

// A tiny inline progress bar instead of a bare "3/30" string -- lets an
// admin spot who's close to their limit at a glance across a whole page of
// rows, not just by reading numbers one at a time.
function UsageCell({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const atLimit = limit > 0 && used >= limit;
  return (
    <div className="min-w-[110px]">
      <div className={`text-sm font-bold mb-1 ${atLimit ? "text-rose-600" : "text-foreground"}`}>
        {used} <span className="text-muted-foreground font-medium">/ {limit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${atLimit ? "bg-rose-500" : "bg-brand-blue"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground block mb-1">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm"
      />
    </div>
  );
}

// Direct top-up: edits an existing active subscription's numbers in place
// (or, for a Free employer, creates a custom one), plus an optional
// one-off credit addition. Separate from the Gift modal below -- this is
// for "top off what they already have," not "hand them a whole plan."
function AdjustModal({
  row,
  onClose,
  onSaved,
}: {
  row: AdminSubscriptionRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [featuredLimit, setFeaturedLimit] = useState(String(row.plan.featuredLimit));
  const [generalLimit, setGeneralLimit] = useState(String(row.plan.generalLimit));
  const [extraCredits, setExtraCredits] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adjustEmployerSubscriptionAdmin(row.employer.id, {
        featuredLimit: Number(featuredLimit),
        generalLimit: Number(generalLimit),
        extraCredits: extraCredits ? Number(extraCredits) : undefined,
        note: note || undefined,
      });
      toast.success(`Updated ${row.employer.full_name || row.employer.email}'s limits`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update subscription.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Adjust Limits</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{row.employer.full_name || row.employer.email}</p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Featured limit" value={featuredLimit} onChange={setFeaturedLimit} />
          <NumberField label="General limit" value={generalLimit} onChange={setGeneralLimit} />
        </div>
        <NumberField label="Add extra credits (optional)" value={extraCredits} onChange={setExtraCredits} />
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for this adjustment..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl border border-border/60 text-foreground font-bold hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl text-white font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/90"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Full gift: a complete free Pro subscription for a specific employer (a
// friend, a partner, a comped account) -- defaults to the current PRO
// template's numbers, admin can override any of them.
function GiftModal({
  employer,
  onClose,
  onSaved,
}: {
  employer: AdminSubscriptionRow["employer"];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [featuredLimit, setFeaturedLimit] = useState("30");
  const [generalLimit, setGeneralLimit] = useState("100");
  const [includedCredits, setIncludedCredits] = useState("10");
  const [durationDays, setDurationDays] = useState("30");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await giftSubscriptionAdmin(employer.id, {
        featuredLimit: Number(featuredLimit),
        generalLimit: Number(generalLimit),
        includedCredits: Number(includedCredits),
        durationDays: Number(durationDays),
        note: note || undefined,
      });
      toast.success(`Gifted a Pro plan to ${employer.full_name || employer.email}`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to gift subscription.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Gift a Pro Plan</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {employer.full_name || employer.email} — this is a free, price ₹0 subscription, marked as gifted.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Featured limit" value={featuredLimit} onChange={setFeaturedLimit} />
          <NumberField label="General limit" value={generalLimit} onChange={setGeneralLimit} />
          <NumberField label="Bonus credits" value={includedCredits} onChange={setIncludedCredits} />
          <NumberField label="Duration (days)" value={durationDays} onChange={setDurationDays} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Friend of the team"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl border border-border/60 text-foreground font-bold hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl text-white font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Gift Pro
          </button>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_STATUS_STYLES: Record<BillingPayment["status"], string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
};

// Every payment attempt this employer has ever made, PENDING/FAILED ones
// included -- unlike the table's "Last Purchase" column (PAID only, so an
// abandoned checkout never looks like a real purchase there), this view is
// specifically for seeing everything, with status always visible so a
// stuck/failed attempt is never mistaken for a completed one.
function PaymentHistoryModal({
  employer,
  onClose,
}: {
  employer: AdminSubscriptionRow["employer"];
  onClose: () => void;
}) {
  const [payments, setPayments] = useState<BillingPayment[] | null>(null);

  useEffect(() => {
    getEmployerPaymentHistoryAdmin(employer.id)
      .then(setPayments)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load payment history."));
  }, [employer.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg my-8 sm:my-0 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 p-5 border-b border-border/60 shrink-0">
          <div>
            <h3 className="font-bold text-lg text-foreground">Payment History</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{employer.full_name || employer.email}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {payments === null ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No payment attempts yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                      {p.kind === "PLAN" ? <Crown className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-foreground truncate">
                        {p.kind === "PLAN" ? "Pro Plan" : `${p.creditsGranted ?? ""} Credits`}
                      </div>
                      <div className="text-xs text-muted-foreground">{format(new Date(p.createdAt), "d MMM yyyy, h:mm a")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-foreground text-sm">₹{p.amount}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${PAYMENT_STATUS_STYLES[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AdminSubscriptionRow[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [adjustTarget, setAdjustTarget] = useState<AdminSubscriptionRow | null>(null);
  const [giftTarget, setGiftTarget] = useState<AdminSubscriptionRow["employer"] | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminSubscriptionRow["employer"] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllSubscriptionsAdmin({ search: search || undefined, page, limit: PAGE_LIMIT });
      setRows(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load subscriptions.");
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "sub_admin") loadRows();
  }, [user, loadRows]);

  if (user && user.role !== "admin" && user.role !== "sub_admin") {
    return <ComingSoon title="Subscriptions" />;
  }

  const columns: CommonTableColumn<AdminSubscriptionRow>[] = [
    {
      key: "employer",
      title: "Employer",
      minWidth: 200,
      render: (_, r) => (
        <div>
          <div className="font-bold text-foreground">{r.employer.full_name || "—"}</div>
          <div className="text-xs text-muted-foreground">{r.employer.email}</div>
        </div>
      ),
    },
    {
      key: "plan",
      title: "Plan",
      minWidth: 110,
      render: (_, r) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
            r.plan.planType === "PRO" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-secondary text-muted-foreground border-border/60"
          }`}
        >
          {r.plan.planType === "PRO" && <Crown className="w-3 h-3" />}
          {r.plan.planType}
        </span>
      ),
    },
    {
      key: "featured",
      title: "Featured Posts",
      minWidth: 130,
      render: (_, r) => <UsageCell used={r.usage.featuredUsed} limit={r.plan.featuredLimit} />,
    },
    {
      key: "general",
      title: "General Posts",
      minWidth: 130,
      render: (_, r) => <UsageCell used={r.usage.generalUsed} limit={r.plan.generalLimit} />,
    },
    {
      key: "credits",
      title: "Credits Left",
      minWidth: 100,
      render: (_, r) => <span className="font-bold text-foreground">{r.creditsRemaining}</span>,
    },
    {
      key: "expires",
      title: "Plan Expires",
      minWidth: 140,
      render: (_, r) =>
        r.plan.expiresAt ? (
          <span className="text-muted-foreground font-medium">{format(new Date(r.plan.expiresAt), "d MMM yyyy")}</span>
        ) : (
          <span className="text-muted-foreground italic">Doesn&apos;t expire</span>
        ),
    },
    {
      key: "paid",
      title: "Last Purchase",
      minWidth: 160,
      render: (_, r) => {
        if (!r.latestPayment) return <span className="text-muted-foreground">No purchases yet</span>;
        const p = r.latestPayment;
        const label = p.kind === "PLAN" ? "Pro Plan" : `${p.creditsGranted ?? ""} Credits`;
        return (
          <div>
            <div className="font-semibold text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">
              {p.amount === 0 ? (
                <span className="text-emerald-600 font-bold">Gifted by admin</span>
              ) : (
                <>₹{p.amount} · {format(new Date(p.createdAt), "d MMM yyyy")}</>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      align: "right",
      minWidth: 140,
      render: (_, r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            title="View payment history"
            onClick={() => setHistoryTarget(r.employer)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <History className="w-4 h-4" />
          </button>
          {r.plan.planType === "PRO" ? (
            <button
              title="Adjust limits"
              onClick={() => setAdjustTarget(r)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              title="Gift a Pro plan"
              onClick={() => setGiftTarget(r.employer)}
              className="p-2 rounded-lg hover:bg-emerald-100 text-muted-foreground hover:text-emerald-600 transition-colors"
            >
              <Gift className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Every employer&apos;s plan, usage, and payment status. Adjust limits or gift a plan directly.
        </p>
      </div>

      {error && <div className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100">{error}</div>}

      <CommonTable<AdminSubscriptionRow, number>
        columns={columns}
        data={rows}
        rowKey={(r) => r.employer.id}
        loading={isLoading}
        emptyMessage="No employers found."
        search={{ value: searchInput, onChange: setSearchInput, placeholder: "Search by name or email..." }}
        pagination={
          meta
            ? { page: meta.page, totalPages: meta.totalPages, total: meta.total, limit: meta.limit, onPageChange: setPage }
            : undefined
        }
      />

      {adjustTarget && (
        <AdjustModal
          row={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSaved={() => {
            setAdjustTarget(null);
            loadRows();
          }}
        />
      )}

      {giftTarget && (
        <GiftModal
          employer={giftTarget}
          onClose={() => setGiftTarget(null)}
          onSaved={() => {
            setGiftTarget(null);
            loadRows();
          }}
        />
      )}

      {historyTarget && <PaymentHistoryModal employer={historyTarget} onClose={() => setHistoryTarget(null)} />}
    </div>
  );
}
