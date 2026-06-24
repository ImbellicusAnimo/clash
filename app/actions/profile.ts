"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";
import { getFieldErrors, type FormState } from "@/lib/form";
import type { ActionResult } from "@/app/actions/clashes";

const MAX_AVATAR_LENGTH = 1_500_000; // ~1.1 MB decoded
const AVATAR_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
  });
  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error) };
  }

  const bio = parsed.data.bio?.trim();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      bio: bio ? bio : null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile updated." };
}

export async function updateAvatar(
  dataUrl: string | null,
): Promise<ActionResult> {
  const user = await requireUser();

  if (dataUrl !== null) {
    if (!AVATAR_PATTERN.test(dataUrl)) {
      return { ok: false, error: "Unsupported image format." };
    }
    if (dataUrl.length > MAX_AVATAR_LENGTH) {
      return { ok: false, error: "Image is too large. Try a smaller crop." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { avatar: dataUrl },
  });

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { ok: true };
}
