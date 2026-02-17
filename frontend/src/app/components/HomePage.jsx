"use client"

import Hero from "./Hero";
import Benefits from "./Benefits";
import TrustIndicators from "./TrustIndicators";
import ContactSection from "./ContactSection";

export default function HomePage() {
  return (
    <div className="bg-slate-200">
      <Hero />
      <div className="bg-slate-200">
        <Benefits />
        <TrustIndicators />
        <ContactSection />
      </div>
    </div>
  );
}
