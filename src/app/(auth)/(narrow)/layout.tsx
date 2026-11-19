// The width constraint every (auth) page EXCEPT login still wants --
// extracted from (auth)/layout.tsx so login alone can render a wider,
// two-column layout without that constraint, while register/forgot-
// password/verify-email/reset-password keep looking exactly as before
// (none of their own page.tsx content changed, only which folder they
// live in -- route groups don't affect the URL).
export default function NarrowAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full max-w-[420px]">{children}</div>;
}
