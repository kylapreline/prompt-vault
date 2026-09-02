import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "Kyla Preline's Prompt Vault",
  description: "Prompt gallery by Kyla Preline",
  icons: {
    icon: "/Kyla-favicon.png",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${anuphan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
