import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart BKPA",
  description: "কিডনি রোগ বিষয়ক বাংলা জ্ঞানভান্ডার"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
