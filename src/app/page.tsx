import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveRootLocale } from "@/lib/accept-language";

export default async function Home() {
  const h = await headers();
  const locale = resolveRootLocale({
    headers: {
      get(name: string) {
        return h.get(name);
      },
    },
  });
  redirect(`/${locale}`);
}
