'use client'

import { useEffect } from "react";
import { usePathname } from 'next/navigation';

export default function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        // Delay slightly to ensure content is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else if (pathname === "/") {
      // Optional: scroll to top if no hash on home
      // window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}