// Formats a stored date-of-birth value for display in a template. The
// Editor's native <input type="date"> writes ISO "YYYY-MM-DD"; this turns
// that into "14 Mar 1991" to read naturally on the document. Any
// pre-existing free-text value (from before the native picker existed, or
// an unparseable one) is shown exactly as stored -- never hidden or
// replaced with something misleading.
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDisplayDate(value: string | undefined): string {
  if (!value) return "";
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return value;
  const month = MONTH_NAMES[Number(m[2]) - 1];
  if (!month) return value;
  return `${Number(m[3])} ${month} ${m[1]}`;
}
