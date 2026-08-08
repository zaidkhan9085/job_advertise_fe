export function StatusBadge({ status, styles }: { status: string; styles: Record<string, string> }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
        styles[status] ?? "bg-secondary text-muted-foreground border-border/60"
      }`}
    >
      {status}
    </span>
  );
}
