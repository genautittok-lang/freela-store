"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Admin could not load this view</h1>
      <p className="mt-2 text-muted-foreground">Try the login screen. Stats storage is optional and should not block access.</p>
      <div className="mt-6 flex justify-center gap-3">
        <a className="rounded-lg border px-4 py-2 text-sm" href="/admin/login">
          Admin login
        </a>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground" type="button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
