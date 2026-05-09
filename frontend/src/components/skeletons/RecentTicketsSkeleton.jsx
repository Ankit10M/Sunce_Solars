/**
 * RecentTicketsSkeleton — Skeleton for the completed tickets page.
 */
export default function RecentTicketsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded-lg w-80 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-64 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 bg-slate-200 rounded-lg w-24 animate-pulse" />
            <div className="h-9 bg-slate-200 rounded-lg w-32 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-4 border-l-4 border-slate-300 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-24" />
                  <div className="h-7 bg-slate-200 rounded w-12" />
                </div>
                <div className="w-8 h-8 bg-slate-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-7 h-7 bg-slate-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 rounded w-28" />
                  <div className="h-3 bg-slate-200 rounded w-36" />
                </div>
              </div>
              <div className="w-6 h-6 bg-slate-200 rounded ml-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
