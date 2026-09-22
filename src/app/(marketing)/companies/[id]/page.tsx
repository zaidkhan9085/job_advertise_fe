"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  Briefcase,
  Building,
  Calendar,
  Facebook,
  Flag,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  getCompanyById,
  getCompanyRatings,
  reportContent,
  resolveImageUrl,
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  type CompanyDetail,
  type CompanyReview,
  type JobPost,
  ApiError,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCompanyActions } from "@/hooks/useCompanyActions";
import { SHOW_COMPANY_REVIEWS } from "@/lib/featureFlags";
import { buildCompanyWhatsAppUrl, buildCompanyMailtoUrl } from "@/lib/jobShare";
import StarRatingInput from "@/components/common/StarRatingInput";
import JobPosterImage from "@/components/common/JobPosterImage";
import JobCardActions from "@/components/jobs/JobCardActions";
import { useIsRecent } from "@/hooks/useIsRecent";
import { useAppliedJobs } from "@/hooks/useAppliedJobs";

const SIZE_LABELS = Object.fromEntries(COMPANY_SIZE_OPTIONS.map((o) => [o.value, o.label]));
const TYPE_LABELS = Object.fromEntries(COMPANY_TYPE_OPTIONS.map((o) => [o.value, o.label]));

function CompanyJobCard({ job, hasApplied, onApplied }: { job: JobPost; hasApplied: boolean; onApplied: () => void }) {
  const router = useRouter();
  const isNew = useIsRecent(job.createdAt);

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="group h-full flex flex-col bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary/30">
        <JobPosterImage image={job.image} title={job.title} company={job.company} className="w-full h-full" />
        {isNew && (
          <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500 text-white shadow-sm">
            New
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-bold text-foreground text-[13px] leading-snug group-hover:text-brand-blue transition-colors line-clamp-1 mb-1">
          {job.title}
        </h3>
        <div className="flex items-center gap-1 mb-2 text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="text-[11px] font-medium truncate">{job.location}</span>
        </div>
        <div className="mt-auto">
          <JobCardActions job={job} hasApplied={hasApplied} onApplied={onApplied} />
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ review }: { review: CompanyReview }) {
  return (
    <div className="py-4 first:pt-0 border-b border-border/60 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="font-bold text-sm text-foreground">{review.reviewerName}</span>
        <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
      </div>
      <div className="flex items-center gap-0.5 mb-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={`w-3.5 h-3.5 ${n <= review.rating ? "text-amber-400" : "text-border"}`} fill={n <= review.rating ? "currentColor" : "none"} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{review.review}</p>
    </div>
  );
}

export default function CompanyProfilePublicPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [companyData, setCompanyData] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

  const { appliedIds, markApplied } = useAppliedJobs();

  const { company, myRating, toggleFollow, rate, clearRating, toggleBlock } = useCompanyActions(companyData, {
    requireLogin: () => router.push("/login"),
  });
  const reloadCompany = useCallback(() => getCompanyById(params.id), [params.id]);

  const loadReviews = useCallback(
    async (page: number) => {
      setIsReviewsLoading(true);
      try {
        const result = await getCompanyRatings(params.id, { page, limit: 5 });
        setReviews(result.data);
        setReviewsTotal(result.meta.total);
        setReviewsPage(page);
      } catch {
        // A review-list failure shouldn't block the rest of the page.
      } finally {
        setIsReviewsLoading(false);
      }
    },
    [params.id]
  );

  useEffect(() => {
    setIsLoading(true);
    getCompanyById(params.id)
      .then(setCompanyData)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      })
      .finally(() => setIsLoading(false));
    if (SHOW_COMPANY_REVIEWS) loadReviews(1);
  }, [params.id, loadReviews]);

  const handleReport = async () => {
    if (!company) return;
    if (!user) return router.push("/login");
    const reason = prompt(`What's wrong with ${company.name}?`);
    if (!reason?.trim()) return;
    try {
      const result = await reportContent({ companyId: company.id, reason: reason.trim() });
      toast.success(result.message);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit report.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-muted/10 animate-pulse" />;
  }

  if (notFound || !company) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Company not found</h1>
          <p className="text-muted-foreground mb-6">This profile may have been removed.</p>
          <button onClick={() => router.back()} className="text-brand-blue font-bold hover:underline">Back</button>
        </div>
      </div>
    );
  }

  const facts = [
    company.industry && { icon: Briefcase, label: "Industry", value: company.industry.name },
    company.companyType && { icon: ShieldCheck, label: "Company Type", value: TYPE_LABELS[company.companyType] },
    company.companySize && { icon: Users, label: "Company Size", value: SIZE_LABELS[company.companySize] },
    company.foundedYear && { icon: Calendar, label: "Founded", value: String(company.foundedYear) },
    company.jobLocation && { icon: MapPin, label: "Location", value: company.jobLocation.name },
  ].filter(Boolean) as { icon: typeof Briefcase; label: string; value: string }[];

  const socials = [
    company.linkedinUrl && { icon: Linkedin, href: company.linkedinUrl, label: "LinkedIn" },
    company.facebookUrl && { icon: Facebook, href: company.facebookUrl, label: "Facebook" },
    company.instagramUrl && { icon: Instagram, href: company.instagramUrl, label: "Instagram" },
  ].filter(Boolean) as { icon: typeof Linkedin; href: string; label: string }[];

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      {/* Plain dark banner, matching the job detail page's own header, with
          the logo overlapping its bottom edge, LinkedIn-style. */}
      <div className="relative h-40 sm:h-56 bg-[oklch(0.12_0.02_40)]">
        <div className="container-site relative h-full flex flex-col justify-between py-4">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="container-site relative">
        <div className="-mt-12 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 pb-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl shrink-0 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveImageUrl(company.logo)} alt={`${company.name} logo`} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-3xl sm:text-4xl font-black text-brand-blue">{company.name.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight truncate">{company.name}</h1>
            {company.tagline && <p className="text-sm sm:text-base text-muted-foreground font-medium mt-0.5">{company.tagline}</p>}
          </div>
          <div className="flex items-center gap-2 pb-1 shrink-0">
            {company.isOwner ? (
              // This IS the logged-in employer's own company -- following,
              // rating, blocking or reporting yourself makes no sense, so
              // the whole action row is replaced with a link back to the
              // real edit form instead.
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> This is your company — Edit profile
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggleFollow(!!user)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    company.isFollowing
                      ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/30"
                      : "bg-brand-blue text-white hover:bg-brand-blue-medium shadow-sm"
                  }`}
                >
                  {company.isFollowing ? "Following" : "+ Follow"}
                </button>
                <button
                  title={company.isBlocked ? "Unblock" : "Block this employer"}
                  onClick={() => toggleBlock(!!user)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    company.isBlocked ? "bg-rose-50 border-rose-200 text-rose-600" : "border-border/60 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Ban className="w-4 h-4" />
                </button>
                <button title="Report" onClick={handleReport} className="p-2.5 rounded-xl border border-border/60 text-muted-foreground hover:bg-secondary transition-colors">
                  <Flag className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground pb-6 border-b border-border/60">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 opacity-60" /> {company.followerCount} followers
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 opacity-60" />
            {company.ratingCount > 0
              ? `${company.averageRating.toFixed(1)} (${company.ratingCount} review${company.ratingCount === 1 ? "" : "s"})`
              : "No reviews yet"}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 opacity-60" /> {company.jobCount} open job{company.jobCount === 1 ? "" : "s"}
          </span>
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-blue hover:underline">
              <Globe className="w-4 h-4" /> Website
            </a>
          )}
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} className="text-muted-foreground hover:text-brand-blue transition-colors">
              <s.icon className="w-4 h-4" />
            </a>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start pt-8">
          <div className="flex-1 w-full min-w-0 space-y-6">
            {company.description && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-border/60">
                <h3 className="text-lg font-bold text-foreground mb-4">About {company.name}</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{company.description}</p>
              </div>
            )}

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-border/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Open Jobs</h3>
                {company.jobCount > company.jobs.length && (
                  <Link href="/jobs" className="text-sm font-bold text-brand-blue hover:underline">
                    View all
                  </Link>
                )}
              </div>
              {company.jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open jobs from this employer right now.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {company.jobs.map((job) => (
                    <CompanyJobCard key={job.id} job={job} hasApplied={appliedIds.has(job.id)} onApplied={() => markApplied(job.id)} />
                  ))}
                </div>
              )}
            </div>

            {/* Star rating stays available to everyone (except the employer
                who owns this company) -- only the written-review text box
                and other people's written reviews below are hidden for now,
                see SHOW_COMPANY_REVIEWS. Saves immediately on click, same as
                the job detail page's own quick-rate widget, since there's no
                text to compose first. */}
            {!company.isOwner && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-border/60">
                <h3 className="text-lg font-bold text-foreground mb-3">Rate this company</h3>
                <StarRatingInput
                  value={myRating}
                  onChange={(r) => rate(!!user, r, undefined, reloadCompany)}
                  onClear={() => clearRating(reloadCompany)}
                />
              </div>
            )}

            {SHOW_COMPANY_REVIEWS && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-border/60">
              <h3 className="text-lg font-bold text-foreground mb-4">Reviews</h3>

              {isReviewsLoading ? (
                <div className="h-24 rounded-xl bg-secondary/40 animate-pulse" />
              ) : reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No written reviews yet — be the first to share your experience.</p>
              ) : (
                <>
                  <div>
                    {reviews.map((r) => (
                      <ReviewRow key={r.id} review={r} />
                    ))}
                  </div>
                  {reviewsTotal > 5 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                      <button
                        disabled={reviewsPage <= 1}
                        onClick={() => loadReviews(reviewsPage - 1)}
                        className="text-sm font-bold text-brand-blue hover:underline disabled:opacity-30 disabled:no-underline"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-muted-foreground font-medium">
                        Page {reviewsPage} of {Math.ceil(reviewsTotal / 5)}
                      </span>
                      <button
                        disabled={reviewsPage >= Math.ceil(reviewsTotal / 5)}
                        onClick={() => loadReviews(reviewsPage + 1)}
                        className="text-sm font-bold text-brand-blue hover:underline disabled:opacity-30 disabled:no-underline"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            )}
          </div>

          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {facts.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wide mb-4">Company Details</h3>
                <div className="space-y-4">
                  {facts.map((f) => (
                    <div key={f.label} className="flex items-start gap-3">
                      <f.icon className="w-4 h-4 text-brand-blue/60 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{f.label}</p>
                        <p className="text-sm font-semibold text-foreground truncate">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(company.phone || company.whatsapp || company.email) && (
              <div className="bg-white p-6 rounded-2xl border border-border/60 shadow-sm">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wide mb-4">Contact</h3>
                <div className="space-y-3">
                  {company.phone && (
                    <a href={`tel:${company.phone}`} className="flex items-center gap-3 text-sm font-semibold text-foreground hover:text-brand-blue transition-colors">
                      <span className="w-8 h-8 rounded-lg bg-brand-blue/5 text-brand-blue flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </span>
                      {company.phone}
                    </a>
                  )}
                  {company.whatsapp && (
                    <a
                      href={buildCompanyWhatsAppUrl(company.whatsapp, company.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm font-semibold text-foreground hover:text-emerald-600 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </span>
                      {company.whatsapp}
                    </a>
                  )}
                  {company.email && (
                    <a
                      href={buildCompanyMailtoUrl(company.email, company.name)}
                      className="flex items-center gap-3 text-sm font-semibold text-foreground hover:text-brand-blue transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-brand-blue/5 text-brand-blue flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </span>
                      <span className="truncate">{company.email}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {!company.website && !company.description && !company.phone && !company.whatsapp && !company.email && facts.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                <Building className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium">This employer hasn&apos;t filled in their company profile yet.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
