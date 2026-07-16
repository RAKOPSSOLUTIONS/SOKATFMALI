import { logoDataUri } from "@/lib/brand";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-surface via-surface-container-low to-surface-container">
      <LoginForm next={sp?.next ?? "/admin"} logo={logoDataUri("black")} />
    </main>
  );
}
