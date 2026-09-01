import { Carter_One, Roboto_Slab } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PopChoice",
  description: "Find the perfect movie for your group",

  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

const carterOne = Carter_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-carter",
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${carterOne.variable} ${robotoSlab.variable}`}>
      <body className="bg-[#03092b] text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
