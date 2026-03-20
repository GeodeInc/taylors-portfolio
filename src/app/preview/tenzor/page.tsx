"use client";
import { TenzorFullLogo } from "@/components/sections/projects-section";

export default function TenzorPreview() {
  return (
    <div className="w-full h-screen flex items-center justify-center overflow-hidden relative"
      style={{ background: "linear-gradient(160deg, #1c2a3a 0%, #0d1520 100%)" }}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tenzor-dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="#7a9ab5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tenzor-dots)"/>
      </svg>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, transparent 30%, #0d1520 100%)" }}/>
      <div className="relative z-10 w-3/4 max-w-sm"><TenzorFullLogo /></div>
    </div>
  );
}
