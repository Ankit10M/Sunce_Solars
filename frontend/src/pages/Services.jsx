import { Wrench, Activity, LineChart } from 'lucide-react';

export default function Services() {
  const services = [
    {
      title: "Solar Inverter Repair",
      description: "Specializes in multi-brand inverter diagnosis, card-level repairs, and AMC services to minimize downtime.",
      icon: <Wrench className="w-8 h-8 text-brand-500" />
    },
    {
      title: "IoT & Monitoring",
      description: "Provides Remote Monitoring Systems (SCADA) and IoT-based product manufacturing for efficient data-driven insights.",
      icon: <Activity className="w-8 h-8 text-blue-500" />
    },
    {
      title: "Consulting & Technical Services",
      description: "Offers feasibility reports, design support, project commissioning, and robust O&M solutions for solar power plants.",
      icon: <LineChart className="w-8 h-8 text-purple-500" />
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4">Our Services</h1>
        <p className="text-slate-600 text-lg">Comprehensive solar lifecycle solutions addressing everything from component repair to plant commissioning.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((svc, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              {svc.icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">{svc.title}</h3>
            <p className="text-slate-600 leading-relaxed">{svc.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
