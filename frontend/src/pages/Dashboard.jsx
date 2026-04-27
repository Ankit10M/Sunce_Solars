import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Activity, LineChart, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const {user} = useAuth()
  return (
    <div className="space-y-8 animate-fade-in">
 
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-brand-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            The Solar Inverter Doctors
          </h1>
          <p className="text-lg md:text-xl text-brand-100 mb-8 leading-relaxed">
            Welcome{user?.name ? `, ${user.name}` : ''} to Sunce Renewables. Since 2016, we've pioneered the "repair, not replace" approach to solar maintenance. Specializing in component-level diagnostics and IoT monitoring.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/dashboard/services"
              className="bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-semibold transition-all inline-flex items-center shadow-lg shadow-brand-500/30"
            >
              Explore Services
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/dashboard/about"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
 
      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Wrench className="w-6 h-6 text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Inverter Repair</h3>
          <p className="text-slate-600 mb-4 text-sm leading-relaxed">
            Multi-brand diagnosis, card-level repairs, and AMC services to minimize downtime.
          </p>
          <Link to="/dashboard/services" className="text-brand-600 font-medium text-sm flex items-center hover:text-brand-700">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
 
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">IoT & Monitoring</h3>
          <p className="text-slate-600 mb-4 text-sm leading-relaxed">
            Remote Monitoring Systems (SCADA) and advanced IoT-based product manufacturing.
          </p>
          <Link to="/dashboard/services" className="text-brand-600 font-medium text-sm flex items-center hover:text-brand-700">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
 
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LineChart className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Consulting</h3>
          <p className="text-slate-600 mb-4 text-sm leading-relaxed">
            Feasibility reports, design support, project commissioning, and O&M for solar plants.
          </p>
          <Link to="/dashboard/services" className="text-brand-600 font-medium text-sm flex items-center hover:text-brand-700">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
 
      {/* Raise Complaint CTA — only shown when logged in as customer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Facing an inverter issue?</h3>
            <p className="text-slate-500 text-sm mt-0.5">
              Raise a service complaint and our team will get back to you promptly.
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/complaint"
          className="shrink-0 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
        >
          Raise Complaint
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
 
    </div>
  );
}
