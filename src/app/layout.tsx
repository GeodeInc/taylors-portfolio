import type { Metadata, Viewport } from "next";
import { Poppins, Geist_Mono, Chango, Jua } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const chango = Chango({
  variable: "--font-name",
  subsets: ["latin"],
  weight: "400",
});

const jua = Jua({
  variable: "--font-sub",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Taylor Houghtaling – Front-End Developer & Co-Founder",
  description: "Portfolio of Taylor Houghtaling — Front-End Developer & Co-Founder of Tenzor LLC, specializing in React, Next.js, and polished UI/UX.",
  keywords: [
    "Taylor Houghtaling",
    "Taylor Houghtaling developer",
    "Taylor Houghtaling portfolio",
    "Front-End Developer",
    "React Developer",
    "Next.js",
    "UI/UX",
    "Tenzor LLC",
    "web developer",
    "software engineer",
  ],
  authors: [{ name: "Taylor Houghtaling" }],
  creator: "Taylor Houghtaling",
  openGraph: {
    type: "website",
    title: "Taylor Houghtaling – Front-End Developer & Co-Founder",
    description: "Portfolio of Taylor Houghtaling — Front-End Developer & Co-Founder of Tenzor LLC, specializing in React, Next.js, and polished UI/UX.",
    siteName: "Taylor Houghtaling",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taylor Houghtaling – Front-End Developer & Co-Founder",
    description: "Portfolio of Taylor Houghtaling — Front-End Developer & Co-Founder of Tenzor LLC, specializing in React, Next.js, and polished UI/UX.",
    creator: "@taylorhoughtaling",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${poppins.variable} ${chango.variable} ${jua.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
        style={{ backgroundColor: "var(--page-bg)" }}
      >
        <ThemeProvider>
          <a href="#main-content" className="skip-link">Skip to content</a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
