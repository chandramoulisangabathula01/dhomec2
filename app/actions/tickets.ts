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
  // Assuming 'profiles' table has 'role'
  // But for now, simple user check
  if (ticket.user_id !== user.id) {
      // Check admin status if needed
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

  const { error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      message,
    });

  if (error) throw new Error("Failed to send message");

  // Optionally update ticket updated_at
  await supabase.from("tickets").update({ updated_at: new Date().toISOString() }).eq("id", ticketId);

  revalidatePath(`/dashboard/tickets/${ticketId}`);
}
