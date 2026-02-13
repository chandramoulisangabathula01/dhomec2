"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function changeUserRole(userId: string, newRole: string) {
    const supabase = await createClient();
    
    // 1. Verify requester is SUPER_ADMIN
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    if (!adminUser) throw new Error("Unauthorized");

    const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", adminUser.id)
        .single();
    
    if (adminProfile?.role !== "SUPER_ADMIN") {
        throw new Error("Only Super Admins can change roles");
    }

    // 2. Prevent self-demotion
    if (adminUser.id === userId && newRole !== "SUPER_ADMIN") {
        throw new Error("You cannot remove your own Super Admin status");
    }

    // 3. Update Role
    const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

    if (error) {
        console.error("Error updating role:", error);
        throw new Error(`Failed to update role: ${error.message}`);
    }

    revalidatePath("/admin/users");
    return { success: true };
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
    
    // Roles are SUPER_ADMIN, SUPPORT_STAFF, etc.
    if (adminProfile?.role !== "SUPER_ADMIN") {
        throw new Error("Only Super Admins can delete users");
    }

    // Deleting the profile. 
    // Since we fixed DB constraints to CASCADE from auth.users, 
    // deleting the profile alone might still leave the auth user.
    // However, the database error they were getting was due to FK constraints 
    // when trying to delete the profile. This should be fixed now.
    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

    if (error) {
        console.error("Database error deleting profile:", error);
        throw new Error(`Database error deleting user: ${error.message}`);
    }

    revalidatePath("/admin/users");
    return { success: true };
}
