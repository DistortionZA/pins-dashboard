import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pins&Knuckles Hub",
  description: "Internal Pins&Knuckles dashboard for calculators, directories, and team tools.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-black text-white selection:bg-red-600 selection:text-white">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
