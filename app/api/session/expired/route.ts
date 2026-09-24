import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt, deleteSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Target of getUser() when a validly signed session points at a user that no
// longer exists. Cookies can't be deleted while rendering, so the cleanup
// happens here. Without it, /login bounces back to /dashboard (proxy.ts only
// checks the signature) and the browser ends up in a redirect loop.
export async function GET() {
  const cookieStore = await cookies();
  const payload = await decrypt(cookieStore.get("session")?.value);

  // Only clear a session that is really orphaned, so this URL can't be used
  // to log somebody out.
  if (payload?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });
    if (user) redirect("/dashboard");
  }

  await deleteSession();
  redirect("/login");
}
