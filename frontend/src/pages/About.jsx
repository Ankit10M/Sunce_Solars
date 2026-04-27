export default function About() {
  return (
    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 tracking-tight">About Sunce Renewables</h1>
      <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed text-lg">
        <p>
          Founded on October 3, 2016, and dynamically based in Noida, Uttar Pradesh, <strong>Sunce Renewables Private Limited</strong> serves as the industry's premier "Solar Inverter Doctors."
        </p>
        <p>
          We passionately believe in a sustainability-focused <strong className="text-brand-600">"repair, not replace"</strong> approach. By offering component-level diagnostics and card-level repairs, we extend the life of existing multi-brand solar maintenance equipment, significantly reducing downtime and saving costly replacements for our clients.
        </p>
        <p>
          Our facility runs with a dedicated team of experts specializing in cutting-edge IoT innovations, enabling smart Remote Monitoring Systems (SCADA) to ensure your solar investments are always operating at peak efficiency. We also provide comprehensive consulting services including feasibility reports and project commissioning.
        </p>
      </div>
    </div>
  );
}
