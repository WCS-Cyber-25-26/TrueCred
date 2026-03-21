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
      <head>
        <title>TrueCred</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#020817] text-white font-body">
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

