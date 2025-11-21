import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent",
        className
      )}
    ></div>
  );
}
