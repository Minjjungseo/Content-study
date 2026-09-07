import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/app/components/nav/Sidebar";
import { BottomNav } from "@/app/components/nav/BottomNav";

export const metadata: Metadata = {
  title: "Content Study Lab",
  description: "배운 것을 하나 고르고, 적용하고, 복기해서 나만의 콘텐츠 공식으로 쌓는 개인 스터디 앱",
};

export const viewport = {
  themeColor: "#f7f7f8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <Sidebar />
        <div className="min-h-full md:pl-56">
          <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 md:px-8 md:pb-12 md:pt-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
