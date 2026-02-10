"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleAdminRole(userId: string, currentRole: string) {
    const supabase = await createClient();
    
    // 1. Verify the requester is an admin
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) throw new Error("Unauthorized");

    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", adminUser.id)
        .single();
    
    if (adminProfile?.role !== "admin") {
        throw new Error("Only admins can change roles");
    }

    // 2. Prevent admin from removing their own admin role (safety)
    if (adminUser.id === userId && currentRole === "admin") {
        throw new Error("You cannot remove your own admin status");
    }

    // 3. Toggle Role
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

    if (error) {
        console.error(error);
        throw new Error("Failed to update user role");
    }

    revalidatePath("/admin/users");
    return { success: true, newRole };
}

export async function deleteUserProfile(userId: string) {
    const supabase = await createClient();
    
    // Verify requester
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) throw new Error("Unauthorized");
    
    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", adminUser.id)
        .single();
    
    if (adminProfile?.role !== "admin") {
        throw new Error("Unauthorized");
    }

    // Note: We can only delete the profile here. 
    // Deleting the actual Auth user requires the Service Role Key.
    // For now, we just mark them as banned or delete the profile.
    // Since we don't have a 'banned' column yet, let's just delete the profile.
    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

    if (error) {
        console.error(error);
        throw new Error("Failed to delete user profile");
    }

    revalidatePath("/admin/users");
    return { success: true };
}
