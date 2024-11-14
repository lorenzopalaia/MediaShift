import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediaShift",
  description:
    "MediaShift - Free, self-hosted, no-limits, no-ads, no-anything, no BS file conversion service",
  creator: "Lorenzo Palaia",
  keywords:
    "media, conversion, free, unlimited, no-ads, no-limits, image converter, video converter, audio converter, unlimited image converter, unlimited video converter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <Navbar />
        <Toaster />
        <div className="fixed left-0 top-0 z-[-1] h-full w-full overflow-hidden backdrop-blur-md"></div>
        <div className="fixed left-0 top-0 z-[-2] h-full w-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 transform object-cover"
          >
            <source src="/bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container mx-auto min-h-screen max-w-4xl px-8 pt-32 lg:max-w-6xl lg:pt-36 2xl:max-w-7xl 2xl:pt-44">
          {children}
        </div>
      </body>
    </html>
  );
}
