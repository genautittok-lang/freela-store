import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">That URL is not in the Freela tool registry.</p>
      <Link href="/en" className="mt-6 inline-block underline">
        Back to Freela
      </Link>
    </div>
  );
}
