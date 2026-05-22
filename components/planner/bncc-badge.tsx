import { Badge } from "@/components/ui/badge";

interface BNCCBadgeProps {
  code: string;
  description?: string;
}

export function BNCCBadge({ code, description }: BNCCBadgeProps) {
  return (
    <div
      className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-primary/5 border border-primary/10 text-primary font-extrabold text-[10px] sm:text-xs tracking-wider uppercase select-none transition-all hover:bg-primary/10"
      title={description}
    >
      <span className="shrink-0 font-bold bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-md">
        BNCC
      </span>
      <span>{code}</span>
      {description && (
        <span className="text-[10px] font-medium text-muted-foreground max-w-[200px] truncate hidden md:inline">
          {description}
        </span>
      )}
    </div>
  );
}
