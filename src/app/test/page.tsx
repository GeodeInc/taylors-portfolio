"use client";

import { PageLoader } from "@/components/ui/page-loader";
import { HeroSection } from "@/components/sections/hero-section";
import { useState } from "react";

export default function TestPage() {
  const [key, setKey] = useState(0);

  const replay = () => {
    sessionStorage.removeItem("intro-played");
    setKey((k) => k + 1);
  };

  return (
    <>
      <PageLoader key={key}>
        <main className="bg-black">
          <HeroSection />
        </main>
      </PageLoader>

      {/* Replay button — fixed above everything */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-[10001] pointer-events-none">
        <button
          onClick={replay}
          className="pointer-events-auto rounded-full border border-white/20 px-6 py-2 text-sm text-white/60 hover:text-white hover:border-white/40 transition-colors"
        >
          Replay animation
        </button>
      </div>
    </>
  );
}
