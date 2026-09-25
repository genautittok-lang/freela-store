"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">The page could not be rendered. Try again, or return home.</p>
      <button className="mt-6 rounded-lg bg-primary px-4 py-2 text-primary-foreground" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
