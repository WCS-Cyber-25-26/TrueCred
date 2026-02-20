"use client"

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const logoImg = "/logo.png"; // Place logo.png in your public folder

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false); 
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastScrollY.current;
    if (diff > 50 && latest > 150) {
      setIsHidden(true);
    } else if (diff < -20) {
      setIsHidden(false);
    }
    setIsScrolled(latest > 10);
    lastScrollY.current = latest;
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
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-[#043682]/95 backdrop-blur-md shadow-lg" : "bg-[#043682]"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-12 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4" onClick={(e) => scrollToSection(e, "home")}>
          <div className="w-14 h-14">
            <ImageWithFallback
              src={logoImg}
              alt="TrueCred Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="bg-white px-6 py-3 rounded">
            <span className="font-bold text-2xl tracking-tight">
              <span className="text-black">True</span>
              <span className="text-[#043682]">Cred</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-10">
          <Link
            href="/verify"
            className="text-white px-6 py-2.5 border border-white/30 rounded-full transition-all hover:bg-white/10 hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            Verify
          </Link>
          <Link
            href="/about"
            className="text-white px-6 py-2.5 border border-white/30 rounded-full transition-all hover:bg-white/10 hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            About Us
          </Link>
          <Link
            href="/#contact"
            onClick={(e) => scrollToSection(e, "contact")}
            className="text-white px-6 py-2.5 border border-white/30 rounded-full transition-all hover:bg-white/10 hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            Contact
          </Link>
          <Link
            href="/UniversityDashboard"
            className="text-white px-6 py-2.5 border border-white/30 rounded-full transition-all hover:bg-white/10 hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            Dashboard
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login"
            className="bg-white text-[#043682] px-8 py-2.5 border border-white rounded font-bold transition-all hover:bg-transparent hover:text-white hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            Login
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}