"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

function LogoWithFallback() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L3 7V12C3 16.55 7.08 20.74 12 22C16.92 20.74 21 16.55 21 12V7L12 2Z"
            stroke="#60a5fa"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 12L11 14L15 10" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-display font-bold text-white text-2xl tracking-tight">TrueCred</span>
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="TrueCred Logo"
      className="h-12 w-auto object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function NavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative group text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
    >
      {children}
      <span
        className="absolute -bottom-px left-0 right-0 h-px bg-blue-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
      />
    </Link>
  );
}

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const { user } = useAuth();
  const dashboardHref = user ? `/dashboard/${user.role.toLowerCase()}` : "/login";

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
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "border-b border-blue-900/30" : ""
        }`}
      style={{ backgroundColor: "#020817" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 flex items-center h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0"
          onClick={(e) => scrollToSection(e, "home")}
        >
          <LogoWithFallback />
        </Link>

        {/* Center Links */}
        <div className="flex-1 flex items-center justify-center gap-8">
          <NavLink href="/about">About Us</NavLink>
          <NavLink href="/verify">Verify</NavLink>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          {user ? (
            <Link
              href={dashboardHref}
              className="border border-blue-600 text-blue-400 px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:bg-blue-600 hover:text-white"
            >
              My Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="border border-blue-600 text-blue-400 px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:bg-blue-600 hover:text-white"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
