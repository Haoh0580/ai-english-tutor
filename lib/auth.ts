// 只能在伺服器端使用（Server Components、Server Actions、Route Handlers）
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Session } from "@/models/Session";
import { User } from "@/models/User";

export const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type CurrentUser = { id: Types.ObjectId; name: string; email: string };

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: Types.ObjectId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await connectDB();
  await Session.create({ tokenHash: hashToken(token), userId, expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await connectDB();
    await Session.deleteOne({ tokenHash: hashToken(token) });
  }
  cookieStore.delete(SESSION_COOKIE);
}

// 真正的登入驗證：拿 cookie 的 token 去 DB 查 session，再查出使用者
// 用 cache 讓同一次 request 內只查一次
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await connectDB();
  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;

  const user = await User.findById(session.userId);
  if (!user) return null;

  return { id: user._id, name: user.name, email: user.email };
});

// 給頁面用：沒登入就導到登入頁
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// 給 API 用：沒登入回 401
export const unauthorized = () => Response.json({ error: "請先登入" }, { status: 401 });
