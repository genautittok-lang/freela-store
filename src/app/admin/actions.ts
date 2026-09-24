"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@/lib/auth";
import { headers } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] || "local";
  const result = await login(email, password, ip);
  if (!result.ok) {
    redirect(`/admin/login?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}
