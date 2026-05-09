/**
 * SkeletonPrimitives — Reusable low-level skeleton building blocks.
 * All shimmer via Tailwind `animate-pulse`.
 */

// ─── Single line of text ──────────────────────────────────────────
export const SkeletonLine = ({ className = '' }) => (
  <div className={`h-4 bg-slate-200 rounded-lg animate-pulse ${className}`} />
);

// ─── Circle (avatar / icon placeholder) ───────────────────────────
export const SkeletonCircle = ({ size = 'w-12 h-12', className = '' }) => (
  <div className={`${size} bg-slate-200 rounded-full animate-pulse shrink-0 ${className}`} />
);

// ─── Rounded rectangle (icon container / badge) ──────────────────
export const SkeletonBox = ({ className = '' }) => (
  <div className={`bg-slate-200 rounded-xl animate-pulse ${className}`} />
);

// ─── Card wrapper — white bg with border ─────────────────────────
export const SkeletonCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// ─── Stat card (icon + label + value) ────────────────────────────
export const SkeletonStatCard = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4 animate-pulse">
    <div className="p-4 rounded-xl bg-slate-200 w-14 h-14 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-200 rounded w-24" />
      <div className="h-7 bg-slate-200 rounded w-16" />
    </div>
  </div>
);

// ─── Table row placeholder ───────────────────────────────────────
export const SkeletonTableRow = ({ cols = 7 }) => (
  <tr className="border-b border-slate-100 animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className={`h-4 bg-slate-200 rounded ${i === 0 ? 'w-24' : i === cols - 1 ? 'w-20 mx-auto' : 'w-28'}`} />
      </td>
    ))}
  </tr>
);

// ─── Table skeleton with header ──────────────────────────────────
export const SkeletonTable = ({ rows = 5, cols = 7, headerLabels = [] }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headerLabels.length > 0
              ? headerLabels.map((label, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-20" />
                  </th>
                ))
              : Array.from({ length: cols }).map((_, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-20" />
                  </th>
                ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Ticket list item skeleton ───────────────────────────────────
export const SkeletonTicketItem = () => (
  <div className="border border-slate-200 rounded-2xl p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-5 bg-slate-200 rounded w-28" />
            <div className="h-5 bg-slate-200 rounded-full w-24" />
          </div>
          <div className="h-3 bg-slate-200 rounded w-48" />
        </div>
      </div>
      <div className="w-8 h-8 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

// ─── Billing card skeleton ───────────────────────────────────────
export const SkeletonBillingCard = () => (
  <div className="border border-slate-200 rounded-xl p-5 animate-pulse space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-3">
          <div className="h-5 bg-slate-200 rounded w-32" />
          <div className="h-5 bg-slate-200 rounded-full w-16" />
        </div>
        <div className="h-3 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="h-3 bg-slate-200 rounded w-28" />
          <div className="h-3 bg-slate-200 rounded w-28" />
          <div className="h-4 bg-slate-200 rounded w-40 col-span-2" />
        </div>
      </div>
      <div className="w-28 h-9 bg-slate-200 rounded-lg shrink-0" />
    </div>
    {/* Table skeleton */}
    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      <div className="space-y-0">
        <div className="bg-slate-100 px-4 py-2.5 flex gap-6">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-3 bg-slate-200 rounded w-16" />)}
        </div>
        {[1, 2].map(i => (
          <div key={i} className="px-4 py-2.5 flex gap-6 border-t border-slate-200">
            {[1, 2, 3, 4, 5].map(j => <div key={j} className="h-3 bg-slate-200 rounded w-16" />)}
          </div>
        ))}
      </div>
    </div>
    <div className="flex justify-end">
      <div className="w-60 h-12 bg-slate-100 rounded-lg" />
    </div>
  </div>
);

// ─── Profile section skeleton ────────────────────────────────────
export const SkeletonProfileSection = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-16" />
          <div className="h-5 bg-slate-200 rounded w-40" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Inverter item skeleton ──────────────────────────────────────
export const SkeletonInverterItem = () => (
  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-start justify-between animate-pulse">
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-40" />
      <div className="h-3 bg-slate-200 rounded w-32" />
      <div className="h-3 bg-slate-200 rounded w-24" />
      <div className="flex gap-2 mt-2">
        <div className="h-5 bg-slate-200 rounded-md w-36" />
        <div className="h-5 bg-slate-200 rounded-md w-36" />
      </div>
    </div>
    <div className="w-9 h-9 bg-slate-200 rounded-lg ml-3" />
  </div>
);

// ─── Address item skeleton ───────────────────────────────────────
export const SkeletonAddressItem = () => (
  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-5 bg-slate-200 rounded-full w-20" />
        </div>
        <div className="h-3 bg-slate-200 rounded w-56" />
        <div className="h-3 bg-slate-200 rounded w-40" />
      </div>
      <div className="flex gap-2 ml-4">
        <div className="w-20 h-8 bg-slate-200 rounded-lg" />
        <div className="w-9 h-8 bg-slate-200 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Chart placeholder ───────────────────────────────────────────
export const SkeletonChart = ({ height = 'h-72' }) => (
  <div className={`${height} bg-slate-100 rounded-xl animate-pulse flex items-end justify-around px-6 pb-6 pt-10 gap-3`}>
    {[40, 65, 50, 80, 35, 70, 55, 45].map((h, i) => (
      <div key={i} className="bg-slate-200 rounded-t-md flex-1" style={{ height: `${h}%` }} />
    ))}
  </div>
);

// ─── Service report card skeleton ────────────────────────────────
export const SkeletonServiceReportCard = () => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-1 w-full bg-slate-200" />
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-3 bg-slate-200 rounded w-20" />
          </div>
        </div>
        <div className="h-5 bg-slate-200 rounded-full w-20" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 space-y-2">
          <div className="h-2 bg-slate-200 rounded w-12" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-3/4" />
        </div>
        <div className="bg-slate-50 rounded-xl p-3 space-y-2">
          <div className="h-2 bg-slate-200 rounded w-14" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-32" />
            <div className="h-3 bg-slate-200 rounded w-28" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-2 bg-slate-200 rounded w-10 ml-auto" />
            <div className="h-6 bg-slate-200 rounded w-20 ml-auto" />
          </div>
        </div>
      </div>
      <div className="h-11 bg-slate-200 rounded-xl w-full" />
    </div>
  </div>
);

// ─── Mini report list item ───────────────────────────────────────
export const SkeletonMiniReportItem = () => (
  <div className="rounded-xl border border-slate-200 p-3 animate-pulse">
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <div className="h-3.5 bg-slate-200 rounded w-20" />
      <div className="h-4 bg-slate-200 rounded-full w-16" />
    </div>
    <div className="h-3 bg-slate-200 rounded w-24 mb-2" />
    <div className="flex items-center justify-between">
      <div className="h-2.5 bg-slate-200 rounded w-16" />
    </div>
  </div>
);

// ─── Filter bar skeleton ─────────────────────────────────────────
export const SkeletonFilterBar = () => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-16" />
          <div className="h-9 bg-slate-100 rounded-lg border border-slate-200" />
        </div>
      ))}
    </div>
  </div>
);

// ─── KPI card for admin ──────────────────────────────────────────
export const SkeletonKpiCard = ({ isDark = false }) => (
  <div className={`p-6 rounded-2xl shadow-sm border flex items-center justify-between animate-pulse ${
    isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'
  }`}>
    <div className="space-y-2">
      <div className={`h-3 rounded w-28 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <div className={`h-8 rounded w-16 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <div className={`h-2.5 rounded w-24 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
    </div>
    <div className={`p-4 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} w-16 h-16`} />
  </div>
);

// ─── Log table skeleton ──────────────────────────────────────────
export const SkeletonLogTable = ({ rows = 8, isDark = false }) => (
  <div className={`rounded-2xl shadow-sm border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
    <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
      <table className="w-full text-left">
        <thead>
          <tr className={isDark ? 'bg-slate-700' : 'bg-slate-50'}>
            {['Time', 'By', 'Ticket', 'Status', 'Remarks'].map((_, i) => (
              <th key={i} className="p-4">
                <div className={`h-3 rounded w-16 animate-pulse ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className={`border-t animate-pulse ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              {[1, 2, 3, 4, 5].map(j => (
                <td key={j} className="p-4">
                  <div className={`h-3.5 rounded ${j === 5 ? 'w-32' : 'w-20'} ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
