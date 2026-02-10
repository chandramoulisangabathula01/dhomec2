"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEnquiries() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");

  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching enquiries:", error);
    return [];
  }
  return data;
}

export async function updateEnquiryStatus(enquiryId: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");

  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", enquiryId);

  if (error) {
    console.error("Error updating enquiry:", error);
    throw new Error("Failed to update enquiry status");
  }

  revalidatePath("/admin/enquiries");
  return { success: true };
}

export async function deleteEnquiry(enquiryId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");

  const { error } = await supabase
    .from("enquiries")
    .delete()
    .eq("id", enquiryId);

  if (error) throw new Error("Failed to delete enquiry");

  revalidatePath("/admin/enquiries");
  return { success: true };
}
