import type { ReactNode } from "react";

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0ms !important;
        }
      `}</style>
      <div style={{ overflow: "hidden", width: "100vw", height: "100vh" }}>
        {children}
      </div>
    </>
  );
}
