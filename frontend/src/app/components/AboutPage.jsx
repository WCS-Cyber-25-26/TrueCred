import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Users, Target, Shield, Cpu, Zap, Heart, Mail } from "lucide-react";

const TEAM = [
  {
    name: "John Doe",
    position: "Lead Developer",
    image: "https://images.unsplash.com/photo-1762522926157-bcc04bf0b10a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbiUyMGNvcnBvcmF0ZSUyMHByb2ZpbGV8ZW58MXx8fHwxNzcwNTQ1NjA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    name: "Jane Smith",
    position: "Security Researcher",
    image: "https://images.unsplash.com/photo-1659353220940-5c5d0e2164d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFuJTIwY29ycG9yYXRlJTIwcHJvZmlsZXxlbnwxfHx8fDE3NzA1NDU2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    name: "Michael Chen",
    position: "AI Engineer",
    image: "https://images.unsplash.com/photo-1758599543154-7aebd6ef9095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMG1hbiUyGJ1c2luZXNzJTIwYXR0aXJlfGVufDF8fHx8MTc3MDU0NTYxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    name: "Sarah Williams",
    position: "UI/UX Designer",
    image: "https://images.unsplash.com/photo-1704627363842-a169b9743309?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFuJTIwbGVhZGVyc2hpcCUyMHByb2ZpbGV8ZW58MXx8fHwxNzcwNTQ1NjE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    name: "David Rodriguez",
    position: "Backend Developer",
    image: "https://images.unsplash.com/photo-1758876204244-930299843f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwcHJvZmVzc2lvbmFsJTIwb2ZmaWNlJTIwZW1wbG95ZWUlMjBtYW58ZW58MXx8fHwxNzcwNTQ1NjE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#043682] pt-40 pb-24 px-12 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-8 leading-tight">About TrueCred</h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 max-w-3xl mx-auto">
            Securing credentials through innovation. We're building the future of diploma and certificate verification for universities and corporations.
          </p>
        </div>
      </section>

      {/* Mission & Who We Are */}
      <section className="py-24 px-12 bg-gray-50">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#043682] rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-4xl font-black text-[#043682]">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6">
                TrueCred was created to solve a critical problem: credential fraud. In an era where diplomas and certificates can be easily forged, institutions need a reliable way to verify academic achievements.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Our platform combines blockchain technology, cryptographic hashing, and AI-powered forgery detection to provide instant, secure credential verification. We empower universities and employers to verify what matters—ensuring that every credential tells a true story of achievement.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#043682] rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-4xl font-black text-[#043682]">Who We Are</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed font-medium mb-6">
                TrueCred is developed by the Western Cyber Society at Western University, a student-led organization passionate about cybersecurity, AI, and blockchain innovation. Our team brings together computer science students, developers, and designers united by a mission to make credential verification secure, accessible, and trustworthy.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                As students ourselves, we understand the importance of protecting academic integrity and ensuring that hard-earned credentials are recognized and respected worldwide.
              </p>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100">
            <h3 className="text-3xl font-black text-[#043682] mb-8">How It Works</h3>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="shrink-0 w-14 h-14 bg-blue-50 text-[#043682] rounded-2xl flex items-center justify-center shadow-sm">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Cryptographic Hashing</h4>
                  <p className="text-gray-600 font-bold leading-relaxed">Each credential receives a unique digital fingerprint that cannot be replicated or altered.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="shrink-0 w-14 h-14 bg-blue-50 text-[#043682] rounded-2xl flex items-center justify-center shadow-sm">
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Blockchain Verification</h4>
                  <p className="text-gray-600 font-bold leading-relaxed">Credentials are stored on an immutable ledger, providing transparent and tamper-proof record-keeping.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="shrink-0 w-14 h-14 bg-blue-50 text-[#043682] rounded-2xl flex items-center justify-center shadow-sm">
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">AI Forgery Detection</h4>
                  <p className="text-gray-600 font-bold leading-relaxed">Machine learning algorithms scan documents for signs of manipulation, ensuring authenticity at every level.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Team */}
      <section className="py-24 px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
            <div>
              <h2 className="text-4xl font-black text-[#043682] mb-8">Our Technology</h2>
              <p className="text-lg text-gray-600 font-bold mb-8 leading-relaxed">Built with modern, scalable technology designed to grow with your organization:</p>
              <ul className="space-y-4">
                {["Backend: Microservices architecture powered by Python, Java, and JavaScript", "Frontend: Next.js with TailwindCSS and Material UI for seamless user experience", "Security: End-to-end encryption and blockchain integration", "AI/ML: Advanced algorithms for document verification and fraud detection"].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-700 font-bold text-lg">
                    <div className="w-2 h-2 bg-[#22c55e] rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#043682] p-12 rounded-[3rem] text-white">
              <h2 className="text-4xl font-black mb-8">Why Choose TrueCred?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: "Instant Verification", desc: "Verify credentials in seconds, not days" },
                  { title: "Bank-Level Security", desc: "Military-grade encryption protects data" },
                  { title: "Cost-Effective", desc: "Reduce costs while improving accuracy" },
                  { title: "Future-Ready", desc: "Designed to grow with your organization" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-xl font-black text-[#22c55e]">{item.title}</h4>
                    <p className="font-bold opacity-80">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-[#043682] mb-4">Meet the team</h2>
            <p className="text-xl text-gray-600 font-bold">The innovators behind the Western Cyber Society</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {TEAM.map((member, i) => (
              <div key={i} className="text-center group">
                <div className="w-full aspect-square rounded-[2rem] overflow-hidden mb-6 shadow-lg border-4 border-white group-hover:border-[#22c55e] transition-all">
                  <ImageWithFallback src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xl font-black text-gray-900">{member.name}</h4>
                <p className="text-[#043682] font-black uppercase text-sm tracking-widest mt-1">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-12 bg-blue-50">
        <div className="max-w-[1440px] mx-auto text-center">
          <h2 className="text-5xl font-black text-[#043682] mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Innovation", desc: "We leverage cutting-edge technology to solve real-world problems" },
              { icon: Shield, title: "Integrity", desc: "Academic credentials deserve uncompromising protection" },
              { icon: Heart, title: "Accessibility", desc: "Verification should be fast, simple, and affordable for everyone" },
              { icon: Users, title: "Collaboration", desc: "Built by students, for institutions, with transparency at our core" }
            ].map((value, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-md hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-[#043682] text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-4">{value.title}</h4>
                <p className="text-gray-600 font-bold leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section className="py-24 px-12">
        <div className="max-w-4xl mx-auto text-center bg-white p-16 rounded-[3rem] shadow-2xl border-2 border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#22c55e]" />
          <h2 className="text-4xl font-black text-[#043682] mb-6">Get in Touch</h2>
          <p className="text-xl text-gray-700 font-bold mb-10">
            Ready to secure your credentials? Whether you're a university looking to protect your degrees or a corporation seeking to verify applicant credentials, we're here to help.
          </p>
          <button className="bg-[#043682] text-white px-10 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-4 mx-auto hover:bg-[#032b69] transition-all shadow-lg hover:-translate-y-1">
            <Mail className="w-6 h-6" />
            Contact us to learn more
          </button>
        </div>
      </section>
    </div>
  );
}