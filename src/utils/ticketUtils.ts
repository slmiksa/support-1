import { supabase } from '@/integrations/supabase/client';

export interface SiteField {
  id: number;
  field_name: string;
  display_name: string;
  is_required: boolean;
  is_active: boolean;
  sort_order?: number;
  field_type: string;
}

export interface Branch {
  id: number;
  name: string;
  created_at: string;
}

export interface SupportTicket {
  ticket_id: string;
  branch: string;
  priority: string;
  description: string;
  image_url?: string;
  status: string;
  created_at: string;
  support_email: string;
  employee_id: string;
  [key: string]: string | undefined;
}

export const updateSystemFieldName = async (oldName: string, newName: string, newDisplayName: string) => {
  try {
    const { data, error } = await supabase
      .from('site_fields')
      .update({ 
        field_name: newName, 
        display_name: newDisplayName 
      })
      .eq('field_name', oldName)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating system field:', error);
    throw error;
  }
};

export const getAllSiteFields = async (): Promise<SiteField[]> => {
  try {
    const { data, error } = await supabase
      .from('site_fields')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching site fields:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllSiteFields:', error);
    return [];
  }
};

export const getAllBranches = async (): Promise<Branch[]> => {
  try {
    const { data, error } = await supabase
      .from('branches')
      .select('*');

    if (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllBranches:', error);
    return [];
  }
};

export const generateTicketId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomId = Math.random().toString(36).substring(2, 5);
  return `${timestamp}-${randomId}`.toUpperCase();
};

export const saveTicket = async (ticket: SupportTicket): Promise<{ success: boolean; data: any; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticket]);

    if (error) {
      console.error('Error saving ticket:', error);
      return { success: false, data: null, error: error };
    }

    return { success: true, data: data, error: null };
  } catch (error) {
    console.error('Error in saveTicket:', error);
    return { success: false, data: null, error: error };
  }
};
