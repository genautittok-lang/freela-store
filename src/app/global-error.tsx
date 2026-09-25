"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Freela is unavailable</h1>
        <p className="mt-2">A server error occurred. No file contents are shown here.</p>
        <button className="mt-6 rounded-lg border px-4 py-2" type="button" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
