import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex h-full min-h-[7.5rem] min-w-0 w-full flex-1 flex-col items-center gap-3 rounded-[var(--border-radius-lg)] bg-[var(--color-bg-card)] p-6 text-center shadow-[var(--shadow-card)]">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--color-primary)]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-[0.6875rem] font-medium uppercase leading-snug tracking-[0.08em] text-[var(--color-text-muted)]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-serif)] text-2xl font-semibold leading-tight text-[var(--color-text-primary)]">
        {value}
      </span>
    </div>
  );
}
