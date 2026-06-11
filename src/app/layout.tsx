import type { Metadata } from "next";
import { AuthProvider } from "@/lib/firebase/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit",
  description: "Multi-language video calls powered by Eburon AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
