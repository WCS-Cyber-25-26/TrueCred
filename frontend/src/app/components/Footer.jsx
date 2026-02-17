"use client"

import Link from "next/link";

export default function Footer() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#1e293b] text-white py-16">
      <div className="max-w-[1440px] mx-auto px-12">
        <div className="grid grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <Link 
              href="/#home" 
              onClick={() => scrollToSection("home")}
              className="bg-white px-6 py-3 rounded inline-block mb-6"
            >
              <span className="font-bold text-2xl tracking-tight">
                <span className="text-black">True</span>
                <span className="text-[#043682]">Cred</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed font-medium">
              Secure credential verification powered by AI and blockchain technology.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-lg mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/#features" 
                  onClick={() => scrollToSection("features")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#api" className="text-gray-400 hover:text-white transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-gray-400 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/#home" 
                  onClick={() => scrollToSection("home")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a href="#careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#press" className="text-gray-400 hover:text-white transition-colors">
                  Press Kit
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">partnerships@truecred.com</li>
              <li className="text-gray-400">1-800-TRUE-CRD</li>
              <li className="text-gray-400">San Francisco, CA</li>
            </ul>
            {/* Social Media */}
            <div className="flex gap-4 mt-6">
              <a
                href="#linkedin"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#043682] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="#twitter"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#043682] transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="#github"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-[#043682] transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex justify-between items-center">
          <p className="text-gray-400">
            © 2026 TrueCred. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/#privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/#terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/#cookies" className="text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}