"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/password";
import { User } from "@/models/User";

export type AuthFormState = {
  error?: string;
  // 失敗時把使用者填的值帶回去（密碼除外）
  values?: { name?: string; email?: string };
} | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  if (!name) return { error: "請輸入名字", values };
  if (!EMAIL_RE.test(email)) return { error: "Email 格式不正確", values };
  if (password.length < 8) return { error: "密碼至少 8 個字元", values };

  await connectDB();
  if (await User.exists({ email })) return { error: "這個 Email 已經註冊過了", values };

  const user = await User.create({ name, email, passwordHash: await hashPassword(password) });
  await createSession(user._id);
  redirect("/practice");
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  await connectDB();
  const user = await User.findOne({ email });
  // 不區分「帳號不存在」和「密碼錯」，避免被拿來試探哪些 Email 有註冊
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email 或密碼錯誤", values };
  }

  await createSession(user._id);
  redirect("/practice");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
