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
  updated_at?: string;
  employee_id: string;
  custom_fields?: Record<string, any>;
  anydesk_number?: string;
  extension_number?: string;
  assigned_to?: string | null;
  support_email?: string;
  id?: string;
};

export interface SiteField {
  id: string | number;
  field_name: string;
  display_name: string;
  placeholder?: string;
  is_required: boolean;
  is_active: boolean;
  created_at?: string;
  sort_order?: number;
}

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
    
    const { error: responsesError } = await supabase
      .from('ticket_responses')
      .delete()
      .eq('ticket_id', ticketId);

    if (responsesError) {
      console.error('Error deleting ticket responses:', responsesError);
      return false;
    }
    
    console.log(`Successfully deleted responses for ticket: ${ticketId}`);

    const { data, error } = await supabase
      .rpc('delete_ticket_by_id', { p_ticket_id: ticketId });

    if (error) {
      console.error('Error calling delete_ticket_by_id function:', error);
      return false;
    }

    if (!data) {
      console.error('Ticket deletion failed');
      return false;
    }
    
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

export const getTicketResponses = async (ticketId: string) => {
  const { data, error } = await supabase
    .from('ticket_responses')
    .select('*, admin:admins(username, employee_id)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching ticket responses:', error);
    throw error;
  }
  
  return data.map(response => ({
    ...response,
    admin_name: response.admin?.username || null,
    admin_employee_id: response.admin?.employee_id || null
  }));
};

export const getAllTicketResponses = async (ticketIds: string[]) => {
  if (!ticketIds.length) return {};
  
  const { data, error } = await supabase
    .from('ticket_responses')
    .select('*, admin:admins(username, employee_id)')
    .in('ticket_id', ticketIds)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching all ticket responses:', error);
    throw error;
  }
  
  const responsesByTicket = data.reduce((acc, response) => {
    const ticketId = response.ticket_id;
    if (!acc[ticketId]) {
      acc[ticketId] = [];
    }
    
    acc[ticketId].push({
      ...response,
      admin_name: response.admin?.username || null,
      admin_employee_id: response.admin?.employee_id || null
    });
    
    return acc;
  }, {});
  
  return responsesByTicket;
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
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('username');
    
    if (error) {
      console.error('Error fetching admins:', error);
      return [];
    }
    
    return data as Admin[];
  } catch (error) {
    console.error('Error in getAllAdmins:', error);
    return [];
  }
};

export const createAdmin = async (admin: {
  username: string;
  role: string;
  employee_id?: string;
  password: string;
}): Promise<{ success: boolean, error?: any }> => {
  try {
    const { error } = await supabase
      .from('admins')
      .insert({
        username: admin.username,
        password: admin.password,
        role: admin.role,
        employee_id: admin.employee_id
      });
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error };
  }
};

export const deleteAdmin = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);
    
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

export const updateSiteField = async (fieldId: string, updates: Partial<SiteField>) => {
  try {
    const { data, error } = await supabase
      .from('site_fields')
      .update(updates)
      .eq('id', fieldId)
      .select();

    if (error) {
      console.error('Error updating site field:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating site field:', error);
    return { success: false, error };
  }
};

export const createSiteField = async (field: Partial<SiteField>) => {
  try {
    const { data, error } = await supabase
      .from('site_fields')
      .insert(field)
      .select();

    if (error) {
      console.error('Error creating site field:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating site field:', error);
    return { success: false, error };
  }
};

export const deleteSiteField = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_fields')
      .delete()
      .eq('id', id);
    
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

export const updateFieldOrder = async (fields: { id: string, sort_order: number }[]): Promise<boolean> => {
  try {
    for (const field of fields) {
      const { error } = await supabase
        .from('site_fields')
        .update({ sort_order: field.sort_order })
        .eq('id', field.id);
      
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

export const updateSystemFieldName = async (fieldName: string, displayName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_fields')
      .update({ display_name: displayName })
      .eq('field_name', fieldName);
    
    if (error) {
      console.error('Error updating system field name:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateSystemFieldName:', error);
    return false;
  }
};

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
    
    return data as SupportTicket[];
  } catch (error) {
    console.error('Error in getTicketsByDateRange:', error);
    return [];
  }
};

export const getTicketsWithResolutionDetails = async (startDate?: string, endDate?: string): Promise<SupportTicket[]> => {
  try {
    console.log(`Fetching tickets from ${startDate} to ${endDate}`);
    let query = supabase
      .from('tickets')
      .select('*');
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tickets with resolution details:', error);
      return [];
    }
    
    // تأكد من تحويل custom_fields بشكل صحيح وأن assigned_to موجود
    const tickets = data.map(ticket => {
      console.log(`Ticket ${ticket.ticket_id} custom fields:`, ticket.custom_fields);
      
      // تحقق وتسجيل قيمة assigned_to
      const assignedTo = ticket.assigned_to || 'لم يتم التعيين';
      
      return {
        ...ticket,
        custom_fields: ticket.custom_fields || {},
        assigned_to: assignedTo  // Use default text if null
      };
    });
    
    return tickets as SupportTicket[];
  } catch (error) {
    console.error('Error in getTicketsWithResolutionDetails:', error);
    return [];
  }
};

export const getTicketStats = async (startDate?: string, endDate?: string): Promise<any> => {
  try {
    let query = supabase.from('tickets').select('*');
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching ticket stats:', error);
      return {
        total: 0,
        byStatus: {},
        byBranch: {},
        byStaff: {}
      };
    }
    
    const tickets = data as SupportTicket[];
    
    const total = tickets.length;
    
    const byStatus: Record<string, number> = {};
    const byBranch: Record<string, number> = {};
    const byStaff: Record<string, number> = {};
    
    for (const ticket of tickets) {
      byStatus[ticket.status] = (byStatus[ticket.status] || 0) + 1;
      
      byBranch[ticket.branch] = (byBranch[ticket.branch] || 0) + 1;
      
      if (ticket.assigned_to) {
        byStaff[ticket.assigned_to] = (byStaff[ticket.assigned_to] || 0) + 1;
      }
    }
    
    return {
      total,
      byStatus,
      byBranch,
      byStaff
    };
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

export const getAdminStats = async (startDate?: string, endDate?: string): Promise<any> => {
  try {
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('*');
    
    if (adminError) {
      console.error('Error fetching admins:', adminError);
      return { staffDetails: [] };
    }
    
    let query = supabase
      .from('tickets')
      .select('*, ticket_responses(*, admins:admin_id(username))');
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    const { data: tickets, error: ticketError } = await query;
    
    if (ticketError) {
      console.error('Error fetching tickets with responses:', ticketError);
      return { staffDetails: [] };
    }
    
    const staffDetails = [];
    const adminMap = new Map();
    
    for (const admin of admins) {
      adminMap.set(admin.id, {
        id: admin.id,
        name: admin.username,
        ticketsCount: 0,
        resolvedCount: 0,
        responseCount: 0,
        totalResponseTime: 0,
        responseRate: 0,
        averageResponseTime: 0,
        statusDistribution: {},
        ticketIds: []
      });
    }
    
    for (const ticket of tickets) {
      const assignedTo = ticket.assigned_to;
      const status = ticket.status;
      
      if (assignedTo) {
        let adminData = null;
        for (const [_, data] of adminMap) {
          if (data.name === assignedTo) {
            adminData = data;
            break;
          }
        }
        
        if (adminData) {
          adminData.ticketsCount++;
          
          adminData.statusDistribution[status] = (adminData.statusDistribution[status] || 0) + 1;
          
          if (status === 'resolved' || status === 'closed') {
            adminData.resolvedCount++;
          }
          
          adminData.ticketIds.push(ticket.ticket_id);
          
          if (ticket.ticket_responses && ticket.ticket_responses.length > 0) {
            adminData.responseCount++;
            
            const ticketCreatedAt = new Date(ticket.created_at);
            const firstResponseCreatedAt = new Date(ticket.ticket_responses[0].created_at);
            const responseTimeHours = (firstResponseCreatedAt.getTime() - ticketCreatedAt.getTime()) / (1000 * 60 * 60);
            
            adminData.totalResponseTime += responseTimeHours;
          }
        }
      }
    }
    
    for (const [_, adminData] of adminMap) {
      if (adminData.ticketsCount > 0) {
        adminData.responseRate = (adminData.responseCount / adminData.ticketsCount) * 100;
        adminData.averageResponseTime = adminData.responseCount > 0 
          ? adminData.totalResponseTime / adminData.responseCount 
          : 0;
        
        staffDetails.push(adminData);
      }
    }
    
    return { staffDetails };
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    return { staffDetails: [] };
  }
};
