import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const sfPro = Inter({
  variable: "--font-sf-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "InfoGrid – Display Board",
  description: "Digital information display board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sfPro.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
