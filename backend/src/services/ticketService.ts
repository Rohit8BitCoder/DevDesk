
import { supabase } from "../config/supabaseClient.ts";


export const TicketService = {

  getProjectById: async (project_id: string, userId: string) => {
    return supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("owner_id", userId)
      .single();
  },

  createTicket: async (ticket: any) => {
    return supabase
      .from("tickets")
      .insert([ticket])
      .select("*")
      .single();
  },

  getTicketsByProject: async (project_id: string) => {
    return supabase
      .from("tickets")
      .select("*")
      .eq("project_id", project_id);
  },

  getTicketById: async (ticket_id: string) => {
    return supabase
      .from("tickets")
      .select("*")
      .eq("id", ticket_id)
      .single();
  },

  updateTicket: async (ticket_id: string, updateData: any) => {
    return supabase
      .from("tickets")
      .update(updateData)
      .eq("id", ticket_id)
      .select("*")
      .single();
  },

  deleteTicket: async (ticket_id: string) => {
    return supabase
      .from("tickets")
      .delete()
      .eq("id", ticket_id)
      .select()
      .single();
  },
};
