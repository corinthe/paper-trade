import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prophet Trader - Next.js",
  description: "AI-powered paper trading system with Claude and Alpaca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
