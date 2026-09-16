import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Python Forge — практика backend",
  description: "Адаптивная практика Python и PostgreSQL. Код, тесты и доказанный прогресс.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
