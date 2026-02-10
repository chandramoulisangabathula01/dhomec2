"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getWishlist() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlist")
    .select(`
      id,
      product_id,
      created_at,
      products (
        id, name, slug, price, image_url, brand, category_id,
        categories (name, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
  return data;
}

export async function addToWishlist(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please log in to add items to your wishlist");
  }

  const { error } = await supabase
    .from("wishlist")
    .upsert(
      { user_id: user.id, product_id: productId },
      { onConflict: "user_id,product_id" }
    );

  if (error) {
    console.error("Error adding to wishlist:", error);
    throw new Error("Failed to add to wishlist");
  }

  revalidatePath("/dashboard/wishlist");
  revalidatePath("/products");
  return { success: true };
}

export async function removeFromWishlist(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    console.error("Error removing from wishlist:", error);
    throw new Error("Failed to remove from wishlist");
  }

  revalidatePath("/dashboard/wishlist");
  revalidatePath("/products");
  return { success: true };
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  return !!data;
}
