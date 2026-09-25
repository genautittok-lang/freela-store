export const metadata = {
  robots: { index: false, follow: false },
  title: "Admin · Freela",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
