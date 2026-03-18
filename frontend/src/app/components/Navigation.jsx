"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const logoImg = "/logo.png";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="max-w-[1440px] mx-auto flex items-stretch">
        {/* Logo Section - White Background with Diagonal Cut */}
        <Link
          href="/"
          className="flex items-center justify-center gap-4 bg-white pl-8 pr-16 py-0 relative"
          onClick={(e) => scrollToSection(e, "home")}
          style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 40px) 100%, 0 100%)' }}
        >
          <div className="w-69 h-23">
            <ImageWithFallback
              src={logoImg}
              alt="TrueCred Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* Navigation Links - Blue Background */}
        <div className="flex-1 bg-[#043682] flex items-center px-12 py-3 -ml-10">
          {/* Left Spacer to balance Login button */}
          <div className="w-[100px]"></div>
          
          {/* Centered Navigation Buttons */}
          <nav className="flex-1 flex items-center justify-center gap-15">
            <Link
              href="/about"
              className="text-white px-6 py-2.5 border border-white/30 rounded-full transition-all hover:bg-white/10 hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            >
              About Us
            </Link>
            <Link
              href="/verify"
              className="text-white px-6 py-2.5 border border-white/30 rounded-full transition-all hover:bg-white/10 hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            >
              Verify
            </Link>
            <Link
              href="/UniversityDashboard"
              className="text-white px-6 py-2.5 border border-white/30 rounded-full transition-all hover:bg-white/10 hover:border-[#22c55e] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            >
              Dashboard
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center w-[280px] justify-end">
            <Link
              href="/login"
              className="bg-white text-[#043682] px-8 py-2.5 rounded font-bold transition-all hover:bg-[#22c55e] hover:text-white"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
