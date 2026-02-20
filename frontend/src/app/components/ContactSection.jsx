"use client"

import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactSection() {
  return (
    <section id="contact" className="py-24">
      <div className="max-w-[1440px] mx-auto px-12">
        <div className="bg-[#043682] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
          {/* Left Column - Contact Info */}
          <div className="lg:w-5/12 p-12 lg:p-16 bg-[#032b69] text-white">
            <h2 className="text-5xl font-bold mb-6">Partner With Us</h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed font-medium">
              TrueCred works directly with educational institutions and corporations to establish 
              secure, verified ecosystems. Contact our team to set up your institutional account.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Email Us</p>
                  <p className="text-xl font-medium">partnerships@truecred.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Call Us</p>
                  <p className="text-xl font-medium">1-800-TRUE-CRD</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Visit Us</p>
                  <p className="text-xl font-medium">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:w-7/12 p-12 lg:p-16 bg-white">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Request Institutional Access</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">First Name</label>
                  <input 
                    type="text" 
                    placeholder="John"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#043682] focus:ring-2 focus:ring-[#043682]/20 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#043682] focus:ring-2 focus:ring-[#043682]/20 outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Institution Name</label>
                <input 
                  type="text" 
                  placeholder="University of TrueCred"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#043682] focus:ring-2 focus:ring-[#043682]/20 outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Work Email</label>
                <input 
                  type="email" 
                  placeholder="john@university.edu"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#043682] focus:ring-2 focus:ring-[#043682]/20 outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Message</label>
                <textarea 
                  rows={4}
                  placeholder="Tell us about your institution's verification needs..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#043682] focus:ring-2 focus:ring-[#043682]/20 outline-none transition-all resize-none font-medium"
                ></textarea>
              </div>
              <button className="w-full bg-[#22c55e] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#16a34a] transition-all hover:shadow-lg">
                <Send className="w-5 h-5" />
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
