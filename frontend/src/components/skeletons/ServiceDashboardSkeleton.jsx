/**
 * ServiceDashboardSkeleton — Skeleton for the ticket selection screen in ServiceDashboard.
 */

export default function ServiceDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-200 to-slate-100 rounded-2xl p-8 animate-pulse">
        <div className="flex items-center mb-2 gap-3">
          <div className="w-6 h-6 bg-slate-300 rounded" />
          <div className="h-8 bg-slate-300 rounded w-48" />
        </div>
        <div className="h-4 bg-slate-300/60 rounded w-64 mt-2" />
      </div>

      {/* Ticket List */}
      <div className="grid gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded w-28" />
                <div className="h-3 bg-slate-200 rounded w-64" />
                <div className="flex gap-2 mt-3 flex-wrap">
                  <div className="h-5 bg-slate-200 rounded-full w-20" />
                  <div className="h-5 bg-slate-200 rounded-full w-16" />
                </div>
              </div>
              <div className="w-5 h-5 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
