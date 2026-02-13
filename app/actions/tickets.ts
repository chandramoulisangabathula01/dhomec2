"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTicket(subject: string, message: string, priority: string = "normal") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Create Ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({
      user_id: user.id,
      subject,
      status: "open",
      priority,
    })
    .select()
    .single();

  if (ticketError) {
      console.error(ticketError);
      throw new Error("Failed to create ticket");
  }

  // 2. Add Initial Message
  const { error: msgError } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: ticket.id,
      user_id: user.id,
      message,
    });

  if (msgError) {
      console.error(msgError); 
      // Non-critical, but good to know. Ticket exists.
  }

  revalidatePath("/dashboard/tickets");
  return ticket;
}

export async function getUserTickets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function getTicketDetails(ticketId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(`
        *,
        ticket_messages (
            *,
            profiles (full_name, avatar_url)
        )
    `)
    .eq("id", ticketId)
    .single();
  
  if (error) return null;

  // Access Control
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  
  if (ticket.user_id !== user.id && !['SUPER_ADMIN', 'SUPPORT_STAFF'].includes(profile?.role as any)) {
      return null; 
  }


  // Sort messages
  if (ticket.ticket_messages) {
      ticket.ticket_messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  return ticket;
}

export async function addMessage(ticketId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ['SUPER_ADMIN', 'SUPPORT_STAFF'].includes(profile?.role as any);

  const { error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      message,
      is_staff_reply: isStaff
    });

  if (isStaff && !error) {
      // Send Email Notification to User
      try {
          const { data: ticket } = await supabase
            .from('tickets')
            .select('user:profiles!user_id(email, full_name)')
            .eq('id', ticketId)
            .single();
            
           if (ticket?.user) {
               const userObj: any = Array.isArray(ticket.user) ? ticket.user[0] : ticket.user;
               if (userObj.email) {
                   const { TicketReplyEmail } = await import("@/lib/email-templates");
                   const { sendEmail } = await import("@/lib/notifications");
                   const emailHtml = TicketReplyEmail(ticketId, userObj.full_name || 'Customer', message);
                   await sendEmail(userObj.email, `New Reply on Ticket #${ticketId.slice(0, 8)}`, emailHtml);
               }
           }
      } catch (notifyError) {
          console.error("Failed to send ticket reply notification:", notifyError);
      }
  }


  if (error) {
    console.error("Supabase error sending message:", error);
    throw new Error(`Failed to send message: ${error.message}`);
  }


  // Optionally update ticket updated_at
  await supabase.from("tickets").update({ updated_at: new Date().toISOString() }).eq("id", ticketId);

  revalidatePath(`/dashboard/tickets/${ticketId}`);
  revalidatePath(`/admin/tickets/${ticketId}`);

  return { success: true };
}

export async function updateTicketStatus(ticketId: string, status: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) throw new Error("Unauthorized");
  
    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
  
    if (!['SUPER_ADMIN', 'SUPPORT_STAFF'].includes(profile?.role as any)) {
      throw new Error("Only authorized staff can update ticket status");
    }
  
    const { error } = await supabase
      .from("tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", ticketId);
  
    if (error) {
      console.error("Error updating ticket status:", error.message, error.details);
      throw new Error(`Failed to update status: ${error.message}`);
    }
  
    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath("/admin/tickets");
    return { success: true };
}

