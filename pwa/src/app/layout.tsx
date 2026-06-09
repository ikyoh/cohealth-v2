import { ThemeProvider } from "@/components/theme/theme-provider";
import ReactQueryProvider from "@/utils/queryProvider/react-query-provider";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { PropsWithChildren } from "react";
import "./globals.css";


const defaultFont = Montserrat({
  variable: "--font-default",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoHealth",
  description: "Coordination des soins à domicile",
};

type Props = PropsWithChildren<{
  modal: React.ReactNode
}>


export default function RootLayout({ modal, children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${defaultFont.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {modal}
            {children}
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
