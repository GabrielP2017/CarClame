import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '중고차 구제 패키저 | MVP',
  description: '차량 번호/VIN과 구매일·주행거리만 입력하면, 불일치 탐지 → 환불/보증/보험 경로 → 원클릭 서류 생성까지 한 번에.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link 
          href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" 
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}