import { Suspense } from "react";
import UserNav from "@/components/UserNav";

// 登入後的頁面：上方導覽列固定，下面內容自己捲動（對話頁需要固定高度）
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Suspense fallback={<div className="h-14 border-b border-line" />}>
        <UserNav />
      </Suspense>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
