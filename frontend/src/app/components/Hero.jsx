import Link from "next/link";

export default function Hero() {
  return (
    <section id="home" className="pt-32 pb-20 bg-gradient-to-b from-[#043682] to-[#0a4a9e] text-white">
      <div className="max-w-[1440px] mx-auto px-12">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <h1 className="text-6xl font-bold leading-tight whitespace-nowrap">
              Verify What Matters
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed">
              TrueCred uses advanced AI and blockchain technology to eliminate diploma fraud, 
              providing universities and corporations with instant, reliable credential verification.
            </p>
            <div className="flex gap-4 pt-4">
              <Link 
                href="/verify"
                className="bg-[#22c55e] text-white px-10 py-5 rounded-xl font-bold text-xl transition-all hover:bg-[#16a34a] hover:shadow-xl hover:-translate-y-1 inline-block"
              >
                Verify a Certificate
              </Link>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1632910138458-5bf601f3835e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlY2hub2xvZ3klMjBzZWN1cml0eXxlbnwxfHx8fDE3NjkwNzc5MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Secure verification technology"
                className="w-full h-auto rounded-xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-[#22c55e] text-white px-6 py-3 rounded-lg shadow-xl">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-semibold">Verified Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}