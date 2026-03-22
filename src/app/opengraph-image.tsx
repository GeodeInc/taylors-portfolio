import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const alt = "Taylor Houghtaling – Front-End Developer & Co-Founder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const iconData = await readFile(
    path.join(process.cwd(), "public", "GeodeInc_Icon.png"),
  );
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Navy glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74,98,140,0.35) 0%, transparent 70%)",
          }}
        />

        {/* Subtle grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
          <defs>
            <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#ffffff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* GeodeInc icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          width={96}
          height={96}
          alt=""
          style={{ borderRadius: 20, marginBottom: 28 }}
        />

        {/* Name */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          Taylor Houghtaling
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 400,
            letterSpacing: "0.5px",
          }}
        >
          Front-End Developer & Co-Founder at Tenzor LLC
        </div>

        {/* Pill tags */}
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {["React", "Next.js", "TypeScript", "Framer Motion"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: 9999,
                border: "1px solid rgba(74,98,140,0.6)",
                backgroundColor: "rgba(74,98,140,0.15)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 18,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
