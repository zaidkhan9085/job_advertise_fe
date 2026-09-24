"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Crown, Coins, Briefcase, Star, PlayCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  getMyBilling,
  getCreditPackages,
  createProPlanOrder,
  createCreditPackOrder,
  verifyRazorpayPayment,
  ApiError,
  type MyBilling,
  type CreditPackage,
} from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";

function UsageBar({ label, used, limit, icon: Icon }: { label: string; used: number; limit: number; icon: typeof Briefcase }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const atLimit = limit > 0 && used >= limit;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Icon className="w-4 h-4 text-brand-blue" /> {label}
        </span>
        <span className={`text-sm font-black ${atLimit ? "text-rose-600" : "text-brand-blue"}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${atLimit ? "bg-rose-500" : "bg-brand-blue"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [billing, setBilling] = useState<MyBilling | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [b, p] = await Promise.all([getMyBilling(), getCreditPackages()]);
      setBilling(b);
      setPackages(p);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load billing details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Two network calls, never one: create the order, let Razorpay's own
  // widget collect payment details, then hand what it returns to our
  // backend to verify -- the backend is the only thing that ever actually
  // grants the plan/credits, only after recomputing the signature itself.
  const handleBuyPro = async () => {
    setIsPurchasing("pro");
    try {
      const order = await createProPlanOrder();
      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "thejobs4u",
        description: "Pro Plan Subscription",
        orderId: order.orderId,
        onSuccess: async (response) => {
          try {
            await verifyRazorpayPayment(response);
            toast.success("Pro plan activated!");
            await load();
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Payment verification failed. Contact support if money was deducted.");
          } finally {
            setIsPurchasing(null);
          }
        },
        onDismiss: () => setIsPurchasing(null),
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to start checkout.");
      setIsPurchasing(null);
    }
  };

  const handleBuyCredits = async (pack: CreditPackage) => {
    setIsPurchasing(pack.id);
    try {
      const order = await createCreditPackOrder(pack.id);
      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "thejobs4u",
        description: `${pack.credits} Credits`,
        orderId: order.orderId,
        onSuccess: async (response) => {
          try {
            await verifyRazorpayPayment(response);
            toast.success(`${pack.credits} credits added!`);
            await load();
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Payment verification failed. Contact support if money was deducted.");
          } finally {
            setIsPurchasing(null);
          }
        },
        onDismiss: () => setIsPurchasing(null),
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to start checkout.");
      setIsPurchasing(null);
    }
  };

  if (isLoading || !billing) {
    return (
      <div className="bg-white rounded-2xl border border-border/40 p-12 text-center shadow-sm text-muted-foreground font-medium">
        Loading billing details...
      </div>
    );
  }

  const { plan, usage, credits, payments } = billing;
  const isPro = plan.planType === "PRO";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Plans &amp; Billing</h1>
        <p className="text-muted-foreground mt-1">Your plan, usage this period, credits, and purchase history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current plan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPro ? "bg-amber-50 text-amber-600" : "bg-secondary text-muted-foreground"}`}>
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-lg text-foreground">{isPro ? "Pro Plan" : "Free Plan"}</div>
                {isPro && plan.expiresAt && (
                  <div className="text-xs text-muted-foreground font-medium">
                    Renews/expires {format(new Date(plan.expiresAt), "d MMM yyyy")}
                  </div>
                )}
                {!isPro && (
                  <div className="text-xs text-muted-foreground font-medium">
                    Resets {format(new Date(plan.periodEnd), "d MMM yyyy")}
                  </div>
                )}
              </div>
            </div>
            {!isPro && (
              <button
                onClick={handleBuyPro}
                disabled={isPurchasing === "pro"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-medium transition-colors disabled:opacity-60"
              >
                {isPurchasing === "pro" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                Upgrade to Pro
              </button>
            )}
          </div>

          <div className="space-y-4">
            <UsageBar label="Featured Job Posts" used={usage.featured.used} limit={usage.featured.limit} icon={Star} />
            <UsageBar label="General Job Posts" used={usage.general.used} limit={usage.general.limit} icon={Briefcase} />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <PlayCircle className="w-4 h-4 text-brand-blue" /> Stories
              </span>
              <span className="text-sm font-black text-muted-foreground">
                {usage.story.allowed ? `${usage.story.used} posted this period` : "Not included in your plan"}
              </span>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-lg text-foreground">{credits.remaining} credits</div>
              <div className="text-xs text-muted-foreground font-medium">{credits.used} used of {credits.total} total</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Credits never expire — they&apos;re only spent when you unlock a candidate&apos;s resume or full profile.</p>
          <div className="space-y-2 pt-2 border-t border-border/60">
            {packages.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handleBuyCredits(pack)}
                disabled={isPurchasing === pack.id}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 hover:border-brand-blue/40 hover:bg-brand-blue-muted/10 transition-all disabled:opacity-60"
              >
                <span className="text-sm font-bold text-foreground">{pack.credits} credits</span>
                <span className="text-sm font-black text-brand-blue flex items-center gap-2">
                  {isPurchasing === pack.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  ₹{pack.price}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase history */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/60">
          <h2 className="font-black text-foreground">Purchase History</h2>
        </div>
        {payments.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground text-center">No purchases yet.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                    {p.kind === "PLAN" ? <Crown className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {p.kind === "PLAN" ? "Pro Plan" : `${p.creditsGranted ?? p.creditPackage?.credits ?? ""} Credits`}
                      {p.amount === 0 && <span className="ml-2 text-[10px] font-black uppercase text-emerald-600">Gifted</span>}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {format(new Date(p.createdAt), "d MMM yyyy, h:mm a")}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-black text-foreground">₹{p.amount}</span>
                  {p.status === "PAID" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
