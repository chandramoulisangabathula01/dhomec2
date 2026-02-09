"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      product_id,
      products (
        id,
        name,
        slug,
        price,
        image_url,
        category_id
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cart:", error);
    return [];
  }

  return cartItems;
}

export async function addToCart(productId: string, quantity: number = 1) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // In a real app, we might handle guest carts with cookies, but for this Phase 4 requirement:
    // "Secure REST API architecture" & "OTP Auth", we assume auth is required or we redirect.
    // For now, redirect to login if not authenticated.
    redirect("/login?next=/products"); 
  }

  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existingItem) {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id);

    if (error) console.error("Error updating cart item:", error);
  } else {
    // Insert new item
    const { error } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity: quantity,
    });

    if (error) console.error("Error adding to cart:", error);
  }

  revalidatePath("/cart"); // If we have a cart page
  revalidatePath("/", "layout"); // Update cart count in header
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  if (quantity <= 0) {
    await removeFromCart(itemId);
    return;
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId)
    .eq("user_id", user.id); // Security: ensure user owns item

  if (error) console.error("Error updating cart quantity:", error);
  revalidatePath("/cart");
}

export async function removeFromCart(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) console.error("Error removing from cart:", error);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
