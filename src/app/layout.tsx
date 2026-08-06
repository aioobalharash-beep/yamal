import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YAMAL by TMG — Coast of Oman | Al Seeb, Muscat",
  description:
    "YAMAL by TMG — a 2.21 million m² smart coastal destination in Al Seeb, Muscat. International marina, crystal lagoons, and 6,220 residential units on 1,760m of direct Gulf shoreline. Inspired by Oman Vision 2040.",
  keywords: [
    "YAMAL",
    "TMG",
    "Al Seeb",
    "Muscat",
    "Oman",
    "waterfront",
    "marina",
    "crystal lagoons",
    "luxury real estate",
    "Oman Vision 2040",
  ],
  openGraph: {
    title: "YAMAL by TMG — Coast of Oman",
    description:
      "A 2.21 million m² smart coastal destination on the Gulf of Oman. International marina, crystal lagoons, 6,220 residences.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080A0E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
