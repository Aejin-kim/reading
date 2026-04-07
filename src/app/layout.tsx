import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoLines = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "꿈꾸는 북카페 | 나만의 독서 감상문",
  description: "초등학생부터 중학생까지, 차분하고 따뜻한 공간에서 나의 성장을 기록하는 독서 감상문 웹사이트입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoLines.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-noto bg-background text-text-main">
        {children}
      </body>
    </html>
  );
}
