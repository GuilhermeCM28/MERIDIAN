export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Topbar Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-neutral-800 rounded animate-pulse" />
          <div className="h-4 w-48 bg-neutral-800/60 rounded animate-pulse" />
        </div>
        <div className="h-9 w-24 bg-neutral-800 rounded-lg animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 h-32 flex flex-col justify-between">
            <div className="h-4 w-20 bg-neutral-800 rounded animate-pulse" />
            <div className="h-8 w-32 bg-neutral-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-96 mt-6">
        <div className="h-5 w-40 bg-neutral-800 rounded mb-6 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 w-full bg-neutral-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
