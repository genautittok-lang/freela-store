import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { loginAction } from "../actions";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Admin login · Freela",
};

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await currentAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">Freela admin</h1>
      <p className="mt-1 text-sm text-muted-foreground">Owner access. Rate-limited. Passwords are hashed.</p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <form action={loginAction} className="mt-6 grid gap-3">
        <label className="grid gap-1 text-sm">
          Email
          <input className="h-9 rounded-lg border px-3" name="email" type="email" autoComplete="username" required />
        </label>
        <label className="grid gap-1 text-sm">
          Password
          <input className="h-9 rounded-lg border px-3" name="password" type="password" autoComplete="current-password" required />
        </label>
        <button className="h-9 rounded-lg bg-foreground text-background" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
