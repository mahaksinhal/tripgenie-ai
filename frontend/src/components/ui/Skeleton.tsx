import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-white/5 border border-white/10 backdrop-blur-md", className)}
      {...props}
    />
  )
}
export default Skeleton
