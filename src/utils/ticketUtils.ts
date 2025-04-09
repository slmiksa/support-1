import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export type SupportTicket = {
  ticket_id: string;
  branch: string;
  priority: string;
  description: string;
  image_url: string | null;
  status: string;
  created_at: string;
  employee_id: string;
  custom_fields?: Record<string, any>;
  anydesk_number?: string;
  extension_number?: string;
  assigned_to?: string | null;
};

export type SiteField = {
  id: string;
  field_name: string;
  display_name: string;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
};

export type Branch = {
  id: string;
  name: string;
};

export type Admin = {
  id: string;
  username: string;
  role: string;
  employee_id?: string | null;
  notification_email?: string | null;
};

export const deleteTicket = async (ticketId: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete ticket with ID: ${ticketId}`);
    
    // First, delete all responses associated with the ticket
    const { error: responsesError } = await supabase
      .from('ticket_responses')
      .delete()
      .eq('ticket_id', ticketId);

    if (responsesError) {
      console.error('Error deleting ticket responses:', responsesError);
      return false;
    }
    
    console.log(`Successfully deleted responses for ticket: ${ticketId}`);

    // Use the new Supabase RPC function to delete the ticket
    const { data, error } = await supabase
      .rpc('delete_ticket_by_id', { p_ticket_id: ticketId });

    if (error) {
      console.error('Error calling delete_ticket_by_id function:', error);
      return false;
    }

    // Check if the ticket was actually deleted (data will be true if successful)
    if (!data) {
      console.error('Ticket deletion failed');
      return false;
    }
    
    // Double-check that the ticket was actually deleted
    const { data: checkData, error: checkError } = await supabase
      .from('tickets')
      .select('ticket_id')
      .eq('ticket_id', ticketId);
    
    if (checkError) {
      console.error('Error verifying ticket deletion:', checkError);
      return false;
    }
    
    if (checkData && checkData.length > 0) {
      console.error('Ticket still exists after deletion attempt');
      return false;
    }
    
    console.log(`Confirmed ticket ${ticketId} was successfully deleted`);
    return true;
  } catch (error) {
    console.error('Error in deleteTicket:', error);
    return false;
  }
};

export const findTicketById = async (ticketId: string): Promise<SupportTicket | null> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', ticketId)
      .single();
    
    if (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
    
    return data as SupportTicket;
  } catch (error) {
    console.error('Error in findTicketById:', error);
    return null;
  }
};

export const getTicketResponses = async (ticketId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('ticket_responses')
      .select('*, admins:admin_id(username)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching ticket responses:', error);
      return [];
    }
    
    return data.map(response => ({
      ...response,
      admin_name: response.admins?.username || null
    }));
  } catch (error) {
    console.error('Error in getTicketResponses:', error);
    return [];
  }
};

export const generateTicketId = (): string => {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TK${timestamp}${random}`;
};

export const saveTicket = async (ticket: SupportTicket): Promise<{ success: boolean, error?: any }> => {
  try {
    const { error } = await supabase
      .from('tickets')
      .insert(ticket);
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving ticket:', error);
    return { success: false, error };
  }
};

export const getAllBranches = async (): Promise<Branch[]> => {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
    
    return data as Branch[];
  } catch (error) {
    console.error('Error in getAllBranches:', error);
    return [];
  }
};

export const getAllSiteFields = async (): Promise<SiteField[]> => {
  try {
    const { data, error } = await supabase
      .from('site_fields')
      .select('*')
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching site fields:', error);
      return [];
    }
    
    return data as SiteField[];
  } catch (error) {
    console.error('Error in getAllSiteFields:', error);
    return [];
  }
};

export const createBranch = async (name: string): Promise<{ success: boolean, error?: any }> => {
  return { success: false, error: 'Not implemented' };
};

export const deleteBranch = async (id: string): Promise<boolean> => {
  return false;
};

export const updateBranchName = async (id: string, name: string): Promise<boolean> => {
  return false;
};

export const getAllAdmins = async (): Promise<Admin[]> => {
  return [];
};

export const createAdmin = async (admin: Omit<Admin, 'id'>): Promise<{ success: boolean, error?: any }> => {
  return { success: false, error: 'Not implemented' };
};

export const deleteAdmin = async (id: string): Promise<boolean> => {
  return false;
};

export const updateSiteField = async (field: SiteField): Promise<boolean> => {
  return false;
};

export const createSiteField = async (field: Omit<SiteField, 'id'>): Promise<{ success: boolean, error?: any }> => {
  return { success: false, error: 'Not implemented' };
};

export const deleteSiteField = async (id: string): Promise<boolean> => {
  return false;
};

export const updateFieldOrder = async (fields: { id: string, sort_order: number }[]): Promise<boolean> => {
  return false;
};

export const updateSystemFieldName = async (fieldName: string, displayName: string): Promise<boolean> => {
  return false;
};

export const getTicketsByDateRange = async (startDate: string, endDate: string): Promise<SupportTicket[]> => {
  return [];
};

export const getTicketsWithResolutionDetails = async (): Promise<any[]> => {
  return [];
};

export const getTicketStats = async (): Promise<any> => {
  return {};
};

export const getAdminStats = async (): Promise<any> => {
  return {};
};
