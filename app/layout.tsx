import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Subreddit Vibe Check | Real-time Reddit Sentiment Analysis",
  description: "Discover the mood behind Reddit's hottest conversations. Instantly fetch the top 50 hot posts of any subreddit and analyze their sentiment on the fly.",
  authors: [{ name: "Subreddit Vibe Checker Dev" }],
  keywords: ["reddit", "sentiment analysis", "vibe check", "nlp", "subreddit", "dashboard", "developer assignment"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30 selection:text-orange-200">
        {children}
      </body>
    </html>
  );
}

