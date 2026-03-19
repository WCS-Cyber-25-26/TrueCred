"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "@/context/AuthContext";

const logoImg = "/logo.png";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const { user } = useAuth();
  const dashboardHref = user ? `/dashboard/${user.role.toLowerCase()}` : '/login';

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  const scrollToSection = (e, id) => {
    const element = document.getElementById(id);
    if (element && pathname === "/") {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <motion.nav
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 bg-[#043682] transition-all duration-300 ${
        isScrolled ? "shadow-lg border-b border-white/10" : ""
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-8 flex items-center h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center flex-shrink-0"
          onClick={(e) => scrollToSection(e, "home")}
        >
          <div className="w-32 h-10">
            <ImageWithFallback
              src={logoImg}
              alt="TrueCred Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* Center Links */}
        <nav className="flex-1 flex items-center justify-center gap-8">
          <Link
            href="/about"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/verify"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Verify
          </Link>
        </nav>

        {/* CTA */}
        <div className="flex-shrink-0">
          {user ? (
            <Link
              href={dashboardHref}
              className="bg-white text-[#043682] px-6 py-2 rounded-md text-sm font-bold transition-all hover:bg-[#22c55e] hover:text-white"
            >
              My Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-white text-[#043682] px-6 py-2 rounded-md text-sm font-bold transition-all hover:bg-[#22c55e] hover:text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
