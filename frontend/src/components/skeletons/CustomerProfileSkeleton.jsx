/**
 * CustomerProfileSkeleton — Full-page skeleton matching the CustomerProfile layout.
 * Covers: profile card, inverters, addresses, tracking, and billing.
 */
import {
  SkeletonProfileSection,
  SkeletonInverterItem,
  SkeletonAddressItem,
  SkeletonTicketItem,
  SkeletonBillingCard,
  SkeletonLine,
} from './SkeletonPrimitives';

export default function CustomerProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-2 rounded-xl bg-slate-100 w-9 h-9 animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-lg w-40 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-56 animate-pulse" />
        </div>
      </div>

      {/* Profile Card */}
      <SkeletonProfileSection />

      {/* Inverters Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-slate-200 rounded w-24 animate-pulse" />
          <div className="h-9 bg-slate-200 rounded-lg w-32 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => <SkeletonInverterItem key={i} />)}
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-slate-200 rounded w-40 animate-pulse" />
          <div className="h-9 bg-slate-200 rounded-lg w-32 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => <SkeletonAddressItem key={i} />)}
        </div>
      </div>

      {/* Service Request Tracking */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-6 bg-slate-200 rounded w-56 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-72 animate-pulse" />
          </div>
          <div className="h-9 bg-slate-200 rounded-lg w-24 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <SkeletonTicketItem key={i} />)}
        </div>
      </div>

      {/* Billing & Invoices */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="space-y-2 mb-6">
          <div className="h-6 bg-slate-200 rounded w-40 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-56 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => <SkeletonBillingCard key={i} />)}
        </div>
      </div>
    </div>
  );
}
