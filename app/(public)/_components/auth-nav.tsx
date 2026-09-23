import Link from "next/link";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export default async function AuthNav() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const payload = await decrypt(session);

  if (payload?.userId) {
    return <Link href="/dashboard">Dashboard</Link>;
  }

  return (
    <>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
    </>
  );
}
