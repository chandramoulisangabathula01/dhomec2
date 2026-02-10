"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message || "Invalid login credentials")}`);
  }


  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
        data: {
            full_name: formData.get("full_name") as string,
        }
    }
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message || "An error occurred during registration")}`);
  }


  // Supabase returns a user but with an empty identities array if the user already exists
  // This is a security feature to prevent account enumeration.
  if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
    redirect("/signup?error=User already exists");
  }

  // If session is null but no error, it usually means email confirmation is enabled
  if (!signUpData.session) {
    redirect("/signup?message=Check your email to confirm your account");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard/profile`,
  });

  if (error) {
    redirect(`/login/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login/forgot-password?message=Password reset link sent to your email");
}


