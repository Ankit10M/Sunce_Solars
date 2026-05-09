/**
 * RaiseComplaintSkeleton — Skeleton matching the RaiseComplaint form layout.
 * Covers: page header, inverter select, address, fault details, and AMC sections.
 */

const SkeletonSectionCard = ({ children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
    <div className="px-8 py-5 border-b border-slate-100">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-slate-200 w-11 h-11" />
        <div className="space-y-1.5">
          <div className="h-5 bg-slate-200 rounded w-36" />
          <div className="h-3 bg-slate-200 rounded w-52" />
        </div>
      </div>
    </div>
    <div className="px-8 py-6">{children}</div>
  </div>
);

export default function RaiseComplaintSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-2 rounded-xl bg-slate-100 w-9 h-9 animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-2xl w-14 h-14 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-64 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Section 1: Inverter Selection */}
      <SkeletonSectionCard>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-16" />
          <div className="h-11 bg-slate-100 rounded-xl border border-slate-200" />
        </div>
      </SkeletonSectionCard>

      {/* Section 2: Delivery Address */}
      <SkeletonSectionCard>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-slate-200 rounded w-24" />
              <div className="h-4 bg-slate-200 rounded w-48" />
            </div>
          ))}
        </div>
      </SkeletonSectionCard>

      {/* Section 3: Fault Details */}
      <SkeletonSectionCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[1, 2].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-24" />
              <div className="h-11 bg-slate-100 rounded-xl border border-slate-200" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-36" />
          <div className="h-28 bg-slate-100 rounded-xl border border-slate-200" />
        </div>
      </SkeletonSectionCard>

      {/* Section 4: AMC */}
      <SkeletonSectionCard>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-slate-200 rounded" />
          <div className="h-4 bg-slate-200 rounded w-72" />
        </div>
      </SkeletonSectionCard>

      {/* Footer Buttons */}
      <div className="flex justify-end items-center gap-4 pt-2 pb-6">
        <div className="h-11 bg-slate-200 rounded-xl w-24 animate-pulse" />
        <div className="h-12 bg-slate-200 rounded-xl w-40 animate-pulse" />
      </div>
    </div>
  );
}
