"use client"

import "./globals.css"
import Navigation from "./components/Navigation"
import ScrollToHash from "./components/ScrollToHash"
import Footer from "./components/Footer"
import { usePathname } from "next/navigation"

export default function RootLayout({children}) {
  const pathname = usePathname()
  
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <Navigation />
        <ScrollToHash />  
        <main className="pt-16">{children}</main>
        <Footer />  
      </body>
    </html>
  )
}

