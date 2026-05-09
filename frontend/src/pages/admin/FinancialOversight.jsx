import { useEffect, useState, useRef, useCallback } from 'react';
import { DollarSign, Cpu, TrendingUp, Calendar, Loader, FileDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FinancialOversightSkeleton } from '../../components/skeletons';

export default function FinancialOversight() {
  const { isDark } = useTheme();
  const [financial, setFinancial] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/financial-overview');
      if (isMounted.current) setFinancial(response.data.data);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchFinancialData();
    return () => { isMounted.current = false; };
  }, [fetchFinancialData]);

  if (loading) {
    return <FinancialOversightSkeleton isDark={isDark} />;
  }

  const totalRevenue = financial?.totalRevenue || 0;
  const warrantyClaims = financial?.warrantyClaims || 0;
  const outOfWarrantyClaims = financial?.outOfWarrantyClaims || 0;
  const amcCount = financial?.amcCount || 0;
  const claimResolutionRate = financial?.claimResolutionRate || '0.0';

  const summaryCards = [
    { label: 'Total Revenue', value: totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : '₹0', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Warranty Claims', value: warrantyClaims, icon: ShieldCheck, color: 'bg-blue-500' },
    { label: 'Active AMC Contracts', value: amcCount, icon: Calendar, color: 'bg-purple-500' },
  ];

  const spareParts = financial?.spareParts || [];
  const totalSpareInvestment = financial?.totalSpareInvestment || 0;
  const amcContracts = financial?.amcContracts || [];
  const expiringSoonCount = financial?.expiringSoonCount || 0;

  return (
    <div className={`animate-fade-in space-y-8 pb-10 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Financial & Warranty Oversight</h2>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Consolidated financial overview of contracts and repair resources.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{card.label}</p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AMC Contracts Section - DYNAMIC */}
      <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
        <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: isDark ? '#374151' : '#e2e8f0' }}>
          <h3 className={`text-lg font-bold flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <DollarSign className="w-5 h-5 mr-2 text-green-500" /> AMC Contracts Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total AMC Contracts</p>
            <p className={`text-2xl font-bold text-green-600`}>{amcCount}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active Contracts</p>
            <p className={`text-2xl font-bold text-blue-600`}>{amcContracts.filter(c => c.status === 'Active').length}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Expiring Soon (30 days)</p>
            <p className={`text-2xl font-bold text-amber-600`}>{expiringSoonCount}</p>
          </div>
        </div>

        <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Contract ID</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Customer</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Product</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Plan</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Start Date</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>End Date</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {amcContracts.length > 0 ? amcContracts.map(row => (
                <tr key={row.id} className={`border-t transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <td className={`p-4 font-mono text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.id}</td>
                  <td className={`p-4 font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{row.customer}</td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{row.product || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      row.planType === 'premium'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : row.planType === 'standard'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {row.planType || 'standard'}
                    </span>
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.startDate}</td>
                  <td className={`p-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.endDate}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.status === 'Active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : row.status === 'Expiring Soon'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className={`p-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No AMC contracts found. Create AMC contracts from the Sales dashboard to track them here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spare Parts Consumption - DYNAMIC */}
      <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
        <h3 className={`text-lg font-bold flex items-center mb-6 border-b pb-4 ${isDark ? 'text-white border-slate-700' : 'text-slate-800 border-slate-200'}`}>
          <Cpu className="w-5 h-5 mr-2 text-blue-500" /> Spare Parts Consumption
        </h3>
        <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Component Name</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Total Qty Used</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Est. Total Cost</th>
                <th className={`p-4 font-semibold text-sm uppercase tracking-wider text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Avg Cost/Unit</th>
              </tr>
            </thead>
            <tbody>
              {spareParts.length > 0 ? spareParts.map((row, idx) => {
                const unitCost = row.totalUsed > 0 ? row.totalCost / row.totalUsed : 0;
                return (
                  <tr key={idx} className={`border-t transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                    <td className={`p-4 font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>{row.component}</td>
                    <td className={`p-4 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.totalUsed} units</td>
                    <td className={`p-4 text-right font-semibold text-red-500`}>₹{row.totalCost.toLocaleString('en-IN')}</td>
                    <td className={`p-4 text-right ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>₹{unitCost.toFixed(0)}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className={`p-8 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No spare parts usage data found. Data is populated from service reports and job cards.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {spareParts.length > 0 && (
          <div className={`mt-6 p-4 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total Spare Parts Investment</p>
            <p className="text-2xl font-bold text-red-600">₹{totalSpareInvestment.toLocaleString('en-IN')}</p>
          </div>
        )}
      </div>

      {/* Revenue Trend and Warranty Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Summary */}
        <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Revenue Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total Billing Revenue</span>
              <span className="font-bold text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Spare Parts Cost</span>
              <span className="font-bold text-red-600">₹{totalSpareInvestment.toLocaleString('en-IN')}</span>
            </div>
            <div className={`border my-2 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}></div>
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Net Margin</span>
              <span className={`font-bold ${(totalRevenue - totalSpareInvestment) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(totalRevenue - totalSpareInvestment).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Warranty & Claims Overview - DYNAMIC */}
        <div className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-300 border-slate-100'}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Warranty & Claims Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>In Warranty Claims</span>
              <span className="font-bold text-blue-600">{warrantyClaims}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Out of Warranty</span>
              <span className="font-bold text-amber-600">{outOfWarrantyClaims}</span>
            </div>
            <div className={`border my-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}></div>
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Claim Resolution Rate</span>
              <span className="font-bold text-green-600">{claimResolutionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}