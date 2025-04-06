
import { supabase } from '@/integrations/supabase/client';

export interface SiteField {
  id: number | string;
  field_name: string;
  display_name: string;
  is_required: boolean;
  is_active: boolean;
  sort_order?: number;
  field_type: string;
}

export interface Branch {
  id: number | string;
  name: string;
  created_at: string;
}

export interface Admin {
  id: string;
  username: string;
  password?: string;
  employee_id?: string;
  role: string;
  created_at: string;
}

export interface SupportTicket {
  id?: string;
  ticket_id: string;
  branch: string;
  priority: string;
  description: string;
  image_url?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  employee_id: string;
  assigned_to?: string;
  anydesk_number?: string;
  extension_number?: string;
  custom_fields?: Record<string, any>;
  [key: string]: any;
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

    // Add field_type to match SiteField interface if it doesn't exist
    const fieldsWithType = data?.map(field => ({
      ...field,
      field_type: field.field_type || 'text'
    })) || [];

    return fieldsWithType as SiteField[];
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
    console.log('Saving ticket:', ticket);
    const { data, error } = await supabase
      .from('tickets')
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

// Added missing functions

// Create a new branch
export const createBranch = async (branchName: string): Promise<{ success: boolean; data: any; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('branches')
      .insert([{ name: branchName }])
      .select();

    if (error) {
      console.error('Error creating branch:', error);
      return { success: false, data: null, error: error };
    }

    return { success: true, data: data, error: null };
  } catch (error) {
    console.error('Error in createBranch:', error);
    return { success: false, data: null, error: error };
  }
};

// Delete a branch
export const deleteBranch = async (branchId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', branchId);

    if (error) {
      console.error('Error deleting branch:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteBranch:', error);
    return false;
  }
};

// Get all admins
export const getAllAdmins = async (): Promise<Admin[]> => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*');

    if (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllAdmins:', error);
    return [];
  }
};

// Create a new admin
export const createAdmin = async (admin: {
  username: string;
  password: string;
  employee_id?: string;
  role: string;
}): Promise<{ success: boolean; data: any; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .insert([admin])
      .select();

    if (error) {
      console.error('Error creating admin:', error);
      return { success: false, data: null, error: error };
    }

    return { success: true, data: data, error: null };
  } catch (error) {
    console.error('Error in createAdmin:', error);
    return { success: false, data: null, error: error };
  }
};

// Delete an admin
export const deleteAdmin = async (adminId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', adminId);

    if (error) {
      console.error('Error deleting admin:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAdmin:', error);
    return false;
  }
};

// Find a ticket by ID
export const findTicketById = async (ticketId: string): Promise<SupportTicket | null> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', ticketId)
      .single();

    if (error) {
      console.error('Error finding ticket:', error);
      return null;
    }

    // Convert the database record to SupportTicket interface
    return data ? {
      ...data,
      support_email: 'help@alwaslsaudi.com'
    } as SupportTicket : null;
  } catch (error) {
    console.error('Error in findTicketById:', error);
    return null;
  }
};

// Get ticket responses
export const getTicketResponses = async (ticketId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('ticket_responses')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching ticket responses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTicketResponses:', error);
    return [];
  }
};

// Get tickets by date range
export const getTicketsByDateRange = async (startDate: string, endDate: string): Promise<SupportTicket[]> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets by date range:', error);
      return [];
    }

    // Convert database records to SupportTicket interface
    return (data || []).map(ticket => ({
      ...ticket,
      support_email: 'help@alwaslsaudi.com'
    })) as SupportTicket[];
  } catch (error) {
    console.error('Error in getTicketsByDateRange:', error);
    return [];
  }
};

// Get ticket statistics
export const getTicketStats = async (startDate: string, endDate: string): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byBranch: Record<string, number>;
  byStaff: Record<string, number>;
}> => {
  try {
    // First, get all tickets in the date range
    const tickets = await getTicketsByDateRange(startDate, endDate);
    
    // Calculate statistics
    const stats = {
      total: tickets.length,
      byStatus: {} as Record<string, number>,
      byBranch: {} as Record<string, number>,
      byStaff: {} as Record<string, number>
    };
    
    // Count tickets by status, branch, and staff
    tickets.forEach(ticket => {
      // By status
      const status = ticket.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // By branch
      const branch = ticket.branch || 'unknown';
      stats.byBranch[branch] = (stats.byBranch[branch] || 0) + 1;
      
      // By assigned staff
      if (ticket.assigned_to) {
        stats.byStaff[ticket.assigned_to] = (stats.byStaff[ticket.assigned_to] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error in getTicketStats:', error);
    return {
      total: 0,
      byStatus: {},
      byBranch: {},
      byStaff: {}
    };
  }
};

// Site field management functions
export const updateSiteField = async (
  fieldId: string,
  updates: {
    field_name?: string;
    display_name?: string;
    is_required?: boolean;
    is_active?: boolean;
    sort_order?: number;
    field_type?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_fields')
      .update(updates)
      .eq('id', fieldId);

    if (error) {
      console.error('Error updating site field:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSiteField:', error);
    return false;
  }
};

export const createSiteField = async (
  field: {
    field_name: string;
    display_name: string;
    is_required: boolean;
    is_active: boolean;
    sort_order?: number;
    field_type: string;
  }
): Promise<{ success: boolean; data: any; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('site_fields')
      .insert([field])
      .select();

    if (error) {
      console.error('Error creating site field:', error);
      return { success: false, data: null, error: error };
    }

    return { success: true, data: data, error: null };
  } catch (error) {
    console.error('Error in createSiteField:', error);
    return { success: false, data: null, error: error };
  }
};

export const deleteSiteField = async (fieldId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_fields')
      .delete()
      .eq('id', fieldId);

    if (error) {
      console.error('Error deleting site field:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSiteField:', error);
    return false;
  }
};

export const updateFieldOrder = async (
  fieldUpdates: { id: string; sort_order: number }[]
): Promise<boolean> => {
  try {
    // Update each field one by one
    for (const update of fieldUpdates) {
      const { error } = await supabase
        .from('site_fields')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);

      if (error) {
        console.error('Error updating field order:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateFieldOrder:', error);
    return false;
  }
};
