"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { updateCandidateUser, ApiError, type CandidateUserAdmin, type JobLocationRef } from "@/lib/api";
import PhoneInput from "@/components/common/PhoneInput";
import CityAutocomplete, { toLocationValue, type LocationValue } from "@/components/common/CityAutocomplete";
import { isValidEmail } from "@/lib/isValidEmail";

// Shared between Admin > Candidates and Search Candidates (admin/sub_admin
// view) -- both edit the same underlying User account fields via the same
// endpoint, just reached from a differently-shaped candidate object. Only
// the fields this form actually needs, so either caller's candidate type
// (CandidateUserAdmin, or ATSCandidate.account) satisfies it structurally.
export interface EditableCandidateAccount {
  id: number;
  full_name: string | null;
  email: string;
  phone: string | null;
  jobLocation: JobLocationRef | null;
}

export default function EditCandidateModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: EditableCandidateAccount;
  onClose: () => void;
  onSaved: (updated: CandidateUserAdmin) => void;
}) {
  const [fullName, setFullName] = useState(candidate.full_name ?? "");
  const [email, setEmail] = useState(candidate.email);
  const [phone, setPhone] = useState(candidate.phone ?? "");
  const [location, setLocation] = useState<LocationValue | null>(toLocationValue(candidate.jobLocation));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateCandidateUser(candidate.id, {
        full_name: fullName,
        email,
        phone,
        jobLocationId: location?.id,
      });
      toast.success("Candidate updated");
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update candidate.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Edit Candidate</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border-2 border-transparent focus:border-brand-blue focus:bg-white transition-all outline-none font-medium text-sm"
          />
          <PhoneInput value={phone} onChange={setPhone} />
          <CityAutocomplete value={location} onChange={setLocation} />
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
