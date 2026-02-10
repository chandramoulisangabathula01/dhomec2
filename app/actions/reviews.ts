"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReview(
  productId: string,
  rating: number,
  comment: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in to submit a review");

  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5");

  // Check if user already reviewed this product
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    // Update existing review
    const { error } = await supabase
      .from("reviews")
      .update({ rating, comment })
      .eq("id", existing.id);

    if (error) throw new Error("Failed to update review");
  } else {
    // Create new review
    const { error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        product_id: productId,
        rating,
        comment,
      });

    if (error) {
      console.error("Error creating review:", error);
      throw new Error("Failed to submit review");
    }
  }

  revalidatePath(`/products`);
  return { success: true };
}

export async function getProductReviews(productId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id, rating, comment, created_at,
      profiles (full_name, avatar_url)
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
  return data;
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if admin or review owner
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: review } = await supabase
    .from("reviews")
    .select("user_id")
    .eq("id", reviewId)
    .single();

  if (!review) throw new Error("Review not found");
  if (review.user_id !== user.id && profile?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw new Error("Failed to delete review");

  revalidatePath("/products");
  revalidatePath("/admin/reviews");
  return { success: true };
}
