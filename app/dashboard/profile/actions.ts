"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const full_name = formData.get("full_name") as string;
  const username = formData.get("username") as string;
  const website = formData.get("website") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      username,
      website,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error);
    return { error: "Could not update profile" };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

