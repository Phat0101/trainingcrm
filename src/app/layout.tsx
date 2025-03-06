import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cập nhật kiến thức y khoa liên tục",
  description: "Cập nhật kiến thức y khoa liên tục | Continuous Medical Knowledge Update",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <main className="min-h-screen bg-gray-50">
            {children}
            <Toaster />
          </main>
        </Providers>
      </body>
    </html>
  );
}
