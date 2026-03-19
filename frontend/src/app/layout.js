"use client"

import "./globals.css"
import Navigation from "./components/Navigation"
import ScrollToHash from "./components/ScrollToHash"
import Footer from "./components/Footer"
import { AuthProvider } from "@/context/AuthContext"
import { usePathname } from "next/navigation"

export default function RootLayout({children}) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <html lang="en">
      <body className="bg-black text-black">
        <AuthProvider>
          {!isDashboard && <Navigation />}
          <ScrollToHash />
          <main className={isDashboard ? '' : 'pt-16'}>{children}</main>
          {!isDashboard && <Footer />}
        </AuthProvider>
      </body>
    </html>
  )
}

