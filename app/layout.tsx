import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON to XLSX Converter",
  description: "Convert JSON data into Excel files instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
