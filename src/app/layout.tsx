import type { Metadata } from "next";
import { Poppins, Geist_Mono, Chango, Jua } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Taylor Houghtaling – Software Engineer & Co-Founder",
  description: "Portfolio of Taylor Houghtaling — Full Stack Developer & Creative Technologist building extraordinary digital experiences.",
  keywords: [
    "Taylor Houghtaling",
    "Taylor Houghtaling developer",
    "Taylor Houghtaling portfolio",
    "Full Stack Developer",
    "Creative Technologist",
    "web developer",
    "software engineer",
  ],
  authors: [{ name: "Taylor Houghtaling" }],
  creator: "Taylor Houghtaling",
  openGraph: {
    type: "website",
    title: "Taylor Houghtaling – Software Engineer & Co-Founder",
    description: "Portfolio of Taylor Houghtaling — Full Stack Developer & Creative Technologist building extraordinary digital experiences.",
    siteName: "Taylor Houghtaling",
  },
  twitter: {
    card: "summary",
    title: "Taylor Houghtaling – Software Engineer & Co-Founder",
    description: "Portfolio of Taylor Houghtaling — Full Stack Developer & Creative Technologist building extraordinary digital experiences.",
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
        className={`${poppins.variable} ${chango.variable} ${jua.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
