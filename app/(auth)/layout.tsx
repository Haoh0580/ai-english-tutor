import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// 已經登入的人不需要看登入 / 註冊頁
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  if (await getCurrentUser()) redirect("/practice");
  return children;
}
