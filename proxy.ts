import { NextResponse, type NextRequest } from "next/server";

// 這裡只做「有沒有 session cookie」的快速檢查，讓沒登入的人直接被導去登入頁。
// 真正的驗證（cookie 是否有效、資料是不是本人的）在每個頁面 / API 裡對 DB 做。
// 已登入的人打開登入頁要導回首頁，這件事在登入頁用 DB 判斷（過期的 cookie 才不會無限轉址）。
const PUBLIC_PATHS = ["/", "/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("session");
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!hasSession && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
