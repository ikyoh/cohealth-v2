import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const defaultFont = Montserrat({
  variable: "--font-default",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoHealth",
  description: "Coordination des soins à domicile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${defaultFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
