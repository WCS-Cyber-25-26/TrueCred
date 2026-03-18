"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login logic
    console.log("Logging in with:", email, password);
    // Redirect to dashboard after successful login
    router.push("/UniversityDashboard");
  };

  return (
    <div className="min-h-screen bg-[#043682] flex items-center justify-center p-6 pt-32 pb-24">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-12">
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-4xl font-black tracking-tighter">
                <span className="text-black">True</span>
                <span className="text-[#043682]">Cred</span>
              </span>
            </Link>
            <h1 className="text-3xl font-black text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 font-bold mt-2">Enter your credentials to access your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 ml-1 uppercase tracking-widest">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Password</label>
                <button type="button" className="text-sm font-black text-[#043682] hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#043682] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#032b69] transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Login
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Footer/Contact Prompt */}
          <div className="mt-10 pt-8 border-t-2 border-gray-50 text-center">
            <p className="text-gray-600 font-bold mb-4">Don't have an institutional account?</p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 text-[#043682] font-black hover:gap-3 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Contact us to partner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}