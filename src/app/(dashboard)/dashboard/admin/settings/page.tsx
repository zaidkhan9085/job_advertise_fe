"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, Crown, Coins, Save, Loader2, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ChangePasswordDialog from "@/components/common/ChangePasswordDialog";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import {
  getPlanTemplates,
  updatePlanTemplateAdmin,
  getAllCreditPackagesAdmin,
  createCreditPackageAdmin,
  updateCreditPackageAdmin,
  deleteCreditPackageAdmin,
  getUnlockCostsAdmin,
  updateUnlockCostsAdmin,
  ApiError,
  type PlanTemplate,
  type PlanType,
  type CreditPackage,
} from "@/lib/api";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition-all text-sm";
const labelClass = "text-xs font-semibold text-muted-foreground block mb-1";

// One plan's editable form -- Free and Pro use the identical shape, just
// different starting numbers, so this renders both from the same component
// rather than duplicating the form twice.
function PlanTemplateForm({ template, onSaved }: { template: PlanTemplate; onSaved: (t: PlanTemplate) => void }) {
  const isFree = template.planType === "FREE";
  const [price, setPrice] = useState(String(template.price));
  const [featuredLimit, setFeaturedLimit] = useState(String(template.featuredLimit));
  const [generalLimit, setGeneralLimit] = useState(String(template.generalLimit));
  const [includedCredits, setIncludedCredits] = useState(String(template.includedCredits));
  const [storiesAllowed, setStoriesAllowed] = useState(template.storiesAllowed);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updatePlanTemplateAdmin(template.planType, {
        // Free is free by definition -- price never leaves 0 regardless of
        // what's in the (disabled) field, no matter what state got left in it.
        price: isFree ? 0 : Number(price),
        featuredLimit: Number(featuredLimit),
        generalLimit: Number(generalLimit),
        includedCredits: Number(includedCredits),
        storiesAllowed,
      });
      onSaved(updated);
      toast.success(`${template.planType} plan updated. New purchases will use these numbers — existing subscribers are unaffected.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update plan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-border/60 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Crown className={`w-4 h-4 ${template.planType === "PRO" ? "text-amber-500" : "text-muted-foreground"}`} />
        <h3 className="font-black text-foreground">{template.planType === "PRO" ? "Pro Plan" : "Free Plan"}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Price (₹/month)</label>
          <input
            type="number"
            min={0}
            value={isFree ? 0 : price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isFree}
            title={isFree ? "Free is always ₹0" : undefined}
            className={`${inputClass} ${isFree ? "opacity-50 cursor-not-allowed bg-secondary/40" : ""}`}
          />
        </div>
        <div>
          <label className={labelClass}>Included credits/mo</label>
          <input type="number" min={0} value={includedCredits} onChange={(e) => setIncludedCredits(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Featured job limit</label>
          <input type="number" min={0} value={featuredLimit} onChange={(e) => setFeaturedLimit(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>General job limit</label>
          <input type="number" min={0} value={generalLimit} onChange={(e) => setGeneralLimit(e.target.value)} className={inputClass} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
        <input type="checkbox" checked={storiesAllowed} onChange={(e) => setStoriesAllowed(e.target.checked)} className="w-4 h-4 accent-brand-blue" />
        Stories allowed
      </label>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-medium transition-colors disabled:opacity-60"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save {template.planType === "PRO" ? "Pro" : "Free"} Plan
      </button>
    </div>
  );
}

// Two separate, deliberately different actions: Retire (reversible, hides
// it from the employer purchase page, old Payment rows keep referencing it)
// vs. Delete (permanent, asks for confirmation first). Which one to use is
// the admin's own call -- Zaid explicitly asked for both to be available
// rather than this component silently deciding for him.
function CreditPackageRow({
  pack,
  onSaved,
  onDeleted,
}: {
  pack: CreditPackage;
  onSaved: (p: CreditPackage) => void;
  onDeleted: (id: string) => void;
}) {
  const [credits, setCredits] = useState(String(pack.credits));
  const [price, setPrice] = useState(String(pack.price));
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateCreditPackageAdmin(pack.id, { credits: Number(credits), price: Number(price) });
      onSaved(updated);
      toast.success("Credit package updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update credit package.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    try {
      const updated = await updateCreditPackageAdmin(pack.id, { isActive: !pack.isActive });
      onSaved(updated);
      toast.success(updated.isActive ? "Package re-enabled." : "Package retired — existing purchases are unaffected.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update credit package.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await deleteCreditPackageAdmin(pack.id);
      toast.success("Credit package permanently deleted.");
      onDeleted(pack.id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete credit package.");
    } finally {
      setIsSaving(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${!pack.isActive ? "opacity-50" : ""}`}>
        <input type="number" min={1} value={credits} onChange={(e) => setCredits(e.target.value)} className={`${inputClass} w-24`} />
        <span className="text-xs text-muted-foreground shrink-0">credits for ₹</span>
        <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputClass} w-24`} />
        <button
          onClick={handleSave}
          disabled={isSaving}
          title="Save"
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={handleToggleActive}
          disabled={isSaving}
          title={pack.isActive ? "Retire (reversible -- hides it from purchase, keeps history)" : "Re-enable"}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 shrink-0"
        >
          {pack.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setConfirmingDelete(true)}
          disabled={isSaving}
          title="Delete permanently"
          className="p-2 rounded-lg hover:bg-rose-100 text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-50 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmingDelete}
        title="Delete Credit Package"
        message={`Permanently delete the ${pack.credits}-credit / ₹${pack.price} package?\n\nThis cannot be undone. Past purchases of it stay in employers' history either way -- if you just want to stop offering it, use the retire (eye) button instead.`}
        variant="danger"
        confirmLabel="Delete"
        isConfirming={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

function AddCreditPackageForm({ onAdded }: { onAdded: (p: CreditPackage) => void }) {
  const [credits, setCredits] = useState("");
  const [price, setPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!credits || !price) return;
    setIsSaving(true);
    try {
      const created = await createCreditPackageAdmin(Number(credits), Number(price));
      onAdded(created);
      setCredits("");
      setPrice("");
      toast.success("Credit package added.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add credit package.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input type="number" min={1} placeholder="Credits" value={credits} onChange={(e) => setCredits(e.target.value)} className={`${inputClass} w-24`} />
      <span className="text-xs text-muted-foreground shrink-0">for ₹</span>
      <input type="number" min={0} placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputClass} w-24`} />
      <button
        onClick={handleAdd}
        disabled={isSaving || !credits || !price}
        title="Add package"
        className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors disabled:opacity-50 shrink-0"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      </button>
    </div>
  );
}

function UnlockCostsForm() {
  const [resumeCost, setResumeCost] = useState("");
  const [profileCost, setProfileCost] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getUnlockCostsAdmin()
      .then((c) => {
        setResumeCost(String(c.resumeCost));
        setProfileCost(String(c.profileCost));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateUnlockCostsAdmin({ resumeCost: Number(resumeCost), profileCost: Number(profileCost) });
      setResumeCost(String(updated.resumeCost));
      setProfileCost(String(updated.profileCost));
      toast.success("Unlock costs updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update unlock costs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="border border-border/60 rounded-2xl p-5 space-y-4">
      <h3 className="font-black text-foreground">Candidate Unlock Costs</h3>
      <p className="text-xs text-muted-foreground">How many credits an employer spends to unlock a candidate's resume or full profile.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Resume unlock cost</label>
          <input type="number" min={1} value={resumeCost} onChange={(e) => setResumeCost(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Full profile unlock cost</label>
          <input type="number" min={1} value={profileCost} onChange={(e) => setProfileCost(e.target.value)} className={inputClass} />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-bold hover:bg-brand-blue-medium transition-colors disabled:opacity-60"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Unlock Costs
      </button>
    </div>
  );
}

function PlansAndCreditsSection() {
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([getPlanTemplates(), getAllCreditPackagesAdmin()]);
      setTemplates(t);
      setPackages(p);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load plans & credits.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateTemplate = (updated: PlanTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.planType === updated.planType ? updated : t)));
  };

  const updatePackage = (updated: CreditPackage) => {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const removePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  if (isLoading) return null;

  const free = templates.find((t) => t.planType === "FREE" as PlanType);
  const pro = templates.find((t) => t.planType === "PRO" as PlanType);

  return (
    <div className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <div className="font-black text-foreground">Plans &amp; Credits</div>
          <div className="text-xs text-muted-foreground">
            Editing these only affects new purchases — existing subscribers keep what they already bought.
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {free && <PlanTemplateForm template={free} onSaved={updateTemplate} />}
        {pro && <PlanTemplateForm template={pro} onSaved={updateTemplate} />}
      </div>

      <div className="border border-border/60 rounded-2xl p-5 space-y-3">
        <h3 className="font-black text-foreground">Credit Packages</h3>
        <div className="space-y-2">
          {packages.map((pack) => (
            <CreditPackageRow key={pack.id} pack={pack} onSaved={updatePackage} onDeleted={removePackage} />
          ))}
        </div>
        <div className="pt-2 border-t border-border/60">
          <AddCreditPackageForm onAdded={(p) => setPackages((prev) => [...prev, p])} />
        </div>
      </div>

      <UnlockCostsForm />
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your own account, plans, and credits.</p>
      </div>

      {isChangePasswordOpen && <ChangePasswordDialog onClose={() => setIsChangePasswordOpen(false)} />}

      <div className="bg-white rounded-3xl border border-border/60 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-black text-foreground">{user?.fullName || user?.displayRole}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{user?.displayRole}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsChangePasswordOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/60 bg-white text-sm font-bold text-foreground hover:bg-secondary/60 transition-colors"
        >
          <KeyRound className="w-4 h-4" /> Change Password
        </button>
      </div>

      {user?.role === "admin" && <PlansAndCreditsSection />}
    </div>
  );
}
