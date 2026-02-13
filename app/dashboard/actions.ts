"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTicket(formData: FormData) {
  const supabase = await createClient();
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const priority = formData.get("priority") as string;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Create Ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      user_id: user.id,
      subject,
      priority,
      status: "open",
      type: "GENERAL_QUERY"
    })
    .select()
    .single();

  if (ticketError) {
    console.error("Error creating ticket:", ticketError);
    redirect("/dashboard/tickets?error=failed_to_create");
  }

  // 2. Create Initial Message
  const { error: messageError } = await supabase.from("ticket_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    message,
  });

  if (messageError) {
    console.error("Error creating message:", messageError);
    // Should probably delete the ticket if message fails, or just ignore for now
  } else {
    // 3. Send Email Notification
    if (user.email) {
        try {
            const { TicketCreatedEmail } = await import("@/lib/email-templates");
            const { sendEmail } = await import("@/lib/notifications");
            const emailHtml = TicketCreatedEmail(ticket.id, user.user_metadata?.full_name || user.email.split('@')[0], subject);
            await sendEmail(user.email, `Ticket Received: ${subject}`, emailHtml);
        } catch (emailErr) {
            console.error("Failed to send ticket confirmation email", emailErr);
        }
    }
  }

  revalidatePath("/dashboard/tickets");
  redirect(`/dashboard/tickets/${ticket.id}`);
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const ticketId = formData.get("ticketId") as string;
  const message = formData.get("message") as string;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    message,
  });

  if (error) {
    console.error("Error sending message:", error);
    redirect(`/dashboard/tickets/${ticketId}?error=failed_to_send`);
  }

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}
