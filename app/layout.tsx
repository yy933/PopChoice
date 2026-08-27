import { Carter_One, Roboto_Slab } from "next/font/google";
import "./globals.css";

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
