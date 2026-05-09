/**
 * AdminSkeletons — Skeletons for admin pages: DashboardOverview, MasterTicketManagement,
 * UserManagement, FinancialOversight, SystemLogs.
 */
import { SkeletonKpiCard, SkeletonLogTable, SkeletonChart, SkeletonTableRow } from './SkeletonPrimitives';

// ─── Admin Dashboard Overview ────────────────────────────────────
export function AdminDashboardSkeleton({ isDark = false }) {
  const bg = isDark ? 'bg-slate-700' : 'bg-slate-200';
  return (
    <div className={`space-y-6 animate-fade-in pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`flex justify-between items-end border-b pb-4 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="space-y-2">
          <div className={`h-8 ${bg} rounded-lg w-48 animate-pulse`} />
          <div className={`h-4 ${bg} rounded w-64 animate-pulse`} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <SkeletonKpiCard key={i} isDark={isDark} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {[1, 2].map(i => (
          <div key={i} className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
            <div className={`h-5 ${bg} rounded w-36 mb-6 animate-pulse`} />
            <SkeletonChart />
          </div>
        ))}
      </div>
      <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
        <div className={`h-5 ${bg} rounded w-48 mb-6 animate-pulse`} />
        <SkeletonChart height="h-80" />
      </div>
    </div>
  );
}

// ─── Master Ticket Management ────────────────────────────────────
export function MasterTicketSkeleton({ isDark = false }) {
  const bg = isDark ? 'bg-slate-700' : 'bg-slate-200';
  return (
    <div className={`animate-fade-in space-y-6 pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
        <div className="space-y-2 mb-6 pb-4 border-b" style={{ borderColor: isDark ? '#374151' : '#e2e8f0' }}>
          <div className={`h-7 ${bg} rounded w-56 animate-pulse`} />
          <div className={`h-4 ${bg} rounded w-48 animate-pulse`} />
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 h-10 bg-slate-100 rounded-xl border border-slate-200 animate-pulse" />
          <div className="w-40 h-10 bg-slate-100 rounded-xl border border-slate-200 animate-pulse" />
        </div>
        <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={isDark ? 'bg-slate-700' : 'bg-slate-50'}>
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <th key={i} className="p-4"><div className={`h-3 ${bg} rounded w-16 animate-pulse`} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── User Management ─────────────────────────────────────────────
export function UserManagementSkeleton({ isDark = false }) {
  const bg = isDark ? 'bg-slate-700' : 'bg-slate-200';
  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100';
  return (
    <div className={`animate-fade-in space-y-8 pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`h-8 ${bg} rounded w-56 animate-pulse`} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`p-4 rounded-lg border animate-pulse ${cardBg}`}>
            <div className={`h-3 ${bg} rounded w-28 mb-2`} />
            <div className={`h-7 ${bg} rounded w-12`} />
          </div>
        ))}
      </div>
      <div className={`p-6 rounded-2xl shadow-sm border ${cardBg}`}>
        <div className={`h-6 ${bg} rounded w-40 mb-6 animate-pulse`} />
        <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={isDark ? 'bg-slate-700' : 'bg-gray-200'}>
                {[1, 2, 3, 4].map(i => (
                  <th key={i} className="p-4"><div className={`h-3 ${bg} rounded w-20 animate-pulse`} /></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className={`border-t animate-pulse ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <td className="p-4"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full ${bg}`} /><div className="space-y-1.5"><div className={`h-4 ${bg} rounded w-28`} /><div className={`h-3 ${bg} rounded w-36`} /></div></div></td>
                  <td className="p-4"><div className={`h-5 ${bg} rounded-lg w-20`} /></td>
                  <td className="p-4"><div className={`h-3 ${bg} rounded w-20`} /></td>
                  <td className="p-4 text-right"><div className={`h-8 ${bg} rounded-lg w-20 ml-auto`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Financial Oversight ─────────────────────────────────────────
export function FinancialOversightSkeleton({ isDark = false }) {
  const bg = isDark ? 'bg-slate-700' : 'bg-slate-200';
  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100';
  return (
    <div className={`animate-fade-in space-y-8 pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="space-y-2">
        <div className={`h-7 ${bg} rounded w-64 animate-pulse`} />
        <div className={`h-4 ${bg} rounded w-80 animate-pulse`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className={`p-6 rounded-2xl shadow-sm border animate-pulse ${cardBg}`}>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className={`h-3 ${bg} rounded w-28`} />
                <div className={`h-8 ${bg} rounded w-20`} />
              </div>
              <div className={`p-3 rounded-lg ${bg} w-12 h-12`} />
            </div>
          </div>
        ))}
      </div>
      <div className={`p-6 rounded-2xl shadow-sm border ${cardBg}`}>
        <div className={`h-5 ${bg} rounded w-48 mb-6 animate-pulse`} />
        <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <table className="w-full"><tbody>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}

// ─── System Logs ─────────────────────────────────────────────────
export function SystemLogsSkeleton({ isDark = false }) {
  const bg = isDark ? 'bg-slate-700' : 'bg-slate-200';
  return (
    <div className={`animate-fade-in space-y-6 pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`p-6 rounded-2xl shadow-sm border border-l-4 ${isDark ? 'bg-slate-800 border-slate-700 border-l-slate-600' : 'bg-gray-300 border-slate-100 border-l-slate-800'}`}>
        <div className={`h-7 ${bg} rounded w-72 mb-2 animate-pulse`} />
        <div className={`h-4 ${bg} rounded w-96 animate-pulse`} />
      </div>
      <div className={`p-4 rounded-lg border animate-pulse ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-200'}`}>
        <div className={`h-3 ${bg} rounded w-24 mb-2`} />
        <div className={`h-10 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`} />
      </div>
      <SkeletonLogTable rows={8} isDark={isDark} />
    </div>
  );
}
