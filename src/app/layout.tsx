import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kill The Imposter | Multiplayer Turn-Based Drawing & Deception Game",
  description: "Create or join a room, draw collaborative masterpieces with limited ink, and deduce who the Imposter is before they escape! Vercel-ready multiplayer game.",
  keywords: ["killtheimposter", "multiplayer game", "drawing game", "social deduction", "imposter", "vercel game", "nextjs game"]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
