import { Oswald, Source_Sans_3, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";

import AppBar from "./components/AppBar";
import Footer from "./components/Footer";
import { CompareProvider } from "./components/CompareProvider";
import { getNavIndex } from "@/lib/data";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const fontVars = `${oswald.variable} ${sourceSans.variable} ${sourceSerif.variable} ${jetbrains.variable}`;

const fontTokenStyle = `
  :root {
    --display: ${oswald.style.fontFamily}, "Impact", "Arial Narrow", sans-serif;
    --sans: ${sourceSans.style.fontFamily}, "Franklin Gothic Medium", "Helvetica Neue", Arial, sans-serif;
    --serif: ${sourceSerif.style.fontFamily}, Georgia, serif;
    --mono: ${jetbrains.style.fontFamily}, ui-monospace, "SF Mono", Menlo, monospace;
  }
`;

export const metadata = {
  title: "Insect Diagnostics — Purdue Extension",
  description:
    "A field-guide-style visual identification reference for insects, arachnids, and small invertebrates curated by the Purdue Insect Diversity & Diagnostics Lab.",
};

export default async function RootLayout({ children }) {
  const navIndex = await getNavIndex();
  return (
    <html lang="en" className={fontVars}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: fontTokenStyle }} />
      </head>
      <body>
        <CompareProvider>
          <Suspense fallback={null}>
            <AppBar navIndex={navIndex} />
          </Suspense>
          {children}
          <Footer />
        </CompareProvider>
      </body>
    </html>
  );
}
