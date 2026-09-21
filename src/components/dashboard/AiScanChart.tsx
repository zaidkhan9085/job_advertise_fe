"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { AiScanDay } from "@/lib/api";

// Daily AI-scan bars: scans the AI read (brand colour), scans that fell back to the
// basic reader (amber) and scans that failed outright (grey), stacked. Plain
// flex boxes rather than an SVG so labels stay readable at phone width and no
// chart library is needed. Tap or hover a bar (or focus it with the keyboard)
// to read its numbers in the line above the chart.

const CHART_HEIGHT = "h-48";

// Round the top of the scale up to a tidy number whose half is a whole number
// too, so the middle gridline label is exact.
function niceMax(n: number) {
  if (n <= 4) return 4;
  if (n <= 40) return Math.ceil(n / 4) * 4;
  if (n <= 100) return Math.ceil(n / 10) * 10;
  return Math.ceil(n / 50) * 50;
}

const dayLabel = (date: string) => format(parseISO(date), "d MMM");

export default function AiScanChart({ series }: { series: AiScanDay[] }) {
  const [active, setActive] = useState<number | null>(null);

  const totals = series.map((d) => d.ai + d.basic + d.failed);
  const max = niceMax(Math.max(0, ...totals));
  const hasData = totals.some((t) => t > 0);

  // ~6 evenly spaced date labels, always including the first and last day.
  const labelCount = Math.min(6, series.length);
  const labelIndexes = Array.from(
    new Set(Array.from({ length: labelCount }, (_, k) => Math.round((k * (series.length - 1)) / Math.max(1, labelCount - 1))))
  );

  const shown = active !== null ? series[active] : null;

  return (
    <div>
      <div className="min-h-[2.75rem] text-sm mb-2" aria-live="polite">
        {shown ? (
          <>
            <span className="font-black text-foreground">{format(parseISO(shown.date), "EEE, d MMM yyyy")}</span>
            <span className="text-muted-foreground font-medium">
              {" "}
              — {shown.ai + shown.basic} scan{shown.ai + shown.basic === 1 ? "" : "s"}
              {shown.basic > 0 && ` (${shown.basic} on the basic reader)`}
              {shown.failed > 0 && `, ${shown.failed} failed`}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground font-medium">Tap or hover a bar to see that day.</span>
        )}
      </div>

      <div className="flex gap-2">
        <div className={`flex flex-col justify-between text-[10px] font-bold text-muted-foreground text-right w-7 shrink-0 ${CHART_HEIGHT}`}>
          <span>{max}</span>
          <span>{max / 2}</span>
          <span>0</span>
        </div>

        <div className={`relative flex-1 min-w-0 ${CHART_HEIGHT}`}>
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden="true">
            <div className="border-t border-dashed border-border/70" />
            <div className="border-t border-dashed border-border/70" />
            <div className="border-t border-border" />
          </div>

          <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
            {series.map((day, i) => {
              const total = totals[i];
              return (
                <button
                  key={day.date}
                  type="button"
                  aria-label={`${dayLabel(day.date)}: ${day.ai + day.basic} scans, ${day.failed} failed`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`flex-1 min-w-0 h-full flex items-end rounded-sm outline-none transition-colors ${
                    active === i ? "bg-brand-blue/10" : "hover:bg-secondary/60 focus-visible:bg-secondary/60"
                  }`}
                >
                  {total > 0 && (
                    <span
                      className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden"
                      style={{ height: `${(total / max) * 100}%` }}
                    >
                      {day.ai > 0 && <span className="w-full bg-brand-blue" style={{ height: `${(day.ai / total) * 100}%` }} />}
                      {day.basic > 0 && <span className="w-full bg-amber-400" style={{ height: `${(day.basic / total) * 100}%` }} />}
                      {day.failed > 0 && <span className="w-full bg-zinc-400" style={{ height: `${(day.failed / total) * 100}%` }} />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground pointer-events-none">
              No scans in this period yet.
            </div>
          )}
        </div>
      </div>

      <div className="relative h-5 mt-1 ml-9 mr-1" aria-hidden="true">
        {labelIndexes.map((i) => (
          <span
            key={i}
            className="absolute top-0 text-[10px] font-bold text-muted-foreground whitespace-nowrap -translate-x-1/2"
            style={{ left: `${((i + 0.5) / series.length) * 100}%` }}
          >
            {dayLabel(series[i].date)}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 ml-9 text-xs font-bold text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-blue" /> Read by AI
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Basic reader (AI was busy)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400" /> Failed
        </span>
      </div>
    </div>
  );
}
