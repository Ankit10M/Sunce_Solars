import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-green-100 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 text-center">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-start group">
            <div className="p-4 bg-blue-400 group-hover:bg-green-200 transition-colors rounded-2xl mr-4">
              <Phone className="w-6 h-6 text-brand-900" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Phone</h3>
              <p className="text-slate-600 mt-1 font-medium">+91 9540xxxxx</p>
              <p className="text-slate-600 font-medium">+91 6392xxxxx</p>
            </div>
          </div>
          
          <div className="flex items-start group">
            <div className="p-4 bg-blue-400 group-hover:bg-blue-100 transition-colors rounded-2xl mr-4">
              <Mail className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Email</h3>
              <p className="text-slate-600 mt-1 font-medium">info@suncerenewable.com</p>
            </div>
          </div>

          <div className="flex items-start group">
            <div className="p-4 bg-blue-400 group-hover:bg-purple-100 transition-colors rounded-2xl mr-4">
              <MapPin className="w-6 h-6 text-purple-900" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Registered Office</h3>
              <p className="text-slate-600 mt-1 font-medium leading-relaxed">
                Sector 63A, Noida,<br/>
                Uttar Pradesh, India
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-200 p-8 rounded-3xl border border-slate-300 shadow-inner">
          <h3 className="font-bold text-slate-800 mb-6 text-xl">Get in Touch</h3>
          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full px-5 py-3 rounded-xl border border-b-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800" />
            <input type="email" placeholder="Your Email" className="w-full px-5 py-3 rounded-xl border border-b-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800" />
            <textarea placeholder="Message" rows="4" className="w-full px-5 py-3 rounded-xl border border-b-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"></textarea>
            <button type="button" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
