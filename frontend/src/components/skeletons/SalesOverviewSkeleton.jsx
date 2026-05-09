/**
 * SalesOverviewSkeleton — Full-page skeleton matching the Sales Overview layout.
 * Covers: stat cards, service reports split-view, filters, and tickets table.
 */
import {
  SkeletonStatCard,
  SkeletonServiceReportCard,
  SkeletonMiniReportItem,
  SkeletonFilterBar,
  SkeletonTableRow,
} from './SkeletonPrimitives';

export default function SalesOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded-lg w-56 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-40 animate-pulse" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
        {[1, 2, 3, 4, 5].map(i => <SkeletonStatCard key={i} />)}
      </div>

      {/* Service Completion Reports — Split View */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-2.5 rounded-xl w-10 h-10 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 bg-slate-200 rounded w-48 animate-pulse" />
              <div className="h-3 bg-slate-200 rounded w-56 animate-pulse" />
            </div>
          </div>
          <div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse" />
        </div>

        <div className="flex gap-6" style={{ minHeight: 320 }}>
          {/* Left pane — Detail skeleton */}
          <div className="flex-1 min-w-0">
            <SkeletonServiceReportCard />
          </div>
          {/* Right pane — List skeleton */}
          <div className="w-80 shrink-0 space-y-2.5">
            {[1, 2, 3, 4, 5].map(i => <SkeletonMiniReportItem key={i} />)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <SkeletonFilterBar />

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Ticket ID', 'Customer', 'Status', 'Priority', 'Assigned To', 'Warranty', 'Action'].map((_, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => <SkeletonTableRow key={i} cols={7} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
