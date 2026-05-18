import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse rounded-xl bg-[#C9BCA0]/40',
      className
    )} />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-5 space-y-3">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function ListRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`flex items-center gap-3 px-5 py-3 border-b border-[#C9BCA0] ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-4 w-16 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
