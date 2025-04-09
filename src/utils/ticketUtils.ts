import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface SiteField {
  id: number | string;
  field_name: string;
  display_name: string;
  is_required: boolean;
  is_active: boolean;
  sort_order?: number;
  field_type: string; // Ensure this property exists with a default string type
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
  image_url?: string | null;
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

    const fieldsWithType = data?.map(field => ({
      ...field,
      field_type: field.field_type || 'text' // Provide a default value if field_type doesn't exist
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
  const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `WSL-${randomId}`;
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

export const updateBranchName = async (branchId: string, newName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('branches')
      .update({ name: newName })
      .eq('id', branchId);

    if (error) {
      console.error('Error updating branch name:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateBranchName:', error);
    return false;
  }
};

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

    return data ? {
      ...data,
      support_email: 'help@alwaslsaudi.com'
    } as SupportTicket : null;
  } catch (error) {
    console.error('Error in findTicketById:', error);
    return null;
  }
};

export const getTicketResponses = async (ticketId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('ticket_responses')
      .select('*, admin:admins(username)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching ticket responses:', error);
      return [];
    }

    // Transform data to include admin username if available
    const formattedResponses = data?.map(response => {
      const adminName = response.admin?.username || null;
      const { admin, ...responseWithoutAdmin } = response;
      
      return {
        ...responseWithoutAdmin,
        admin_name: adminName
      };
    }) || [];

    console.log('Formatted responses:', formattedResponses);
    return formattedResponses;
  } catch (error) {
    console.error('Error in getTicketResponses:', error);
    return [];
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

    return (data || []).map(ticket => ({
      ...ticket,
      support_email: 'help@alwaslsaudi.com'
    })) as SupportTicket[];
  } catch (error) {
    console.error('Error in getTicketsByDateRange:', error);
    return [];
  }
};

export const getTicketsWithResolutionDetails = async (startDate: string, endDate: string): Promise<SupportTicket[]> => {
  try {
    // First get all tickets in the date range
    const tickets = await getTicketsByDateRange(startDate, endDate);
    
    // Get all responses to identify which admin resolved each ticket
    const { data: responses, error: respError } = await supabase
      .from('ticket_responses')
      .select('*, admin:admins(username, id)')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });
    
    if (respError) {
      console.error('Error fetching ticket responses:', respError);
      return tickets; // Return tickets without resolution data
    }
    
    // For each ticket, find the admin who provided the first response or resolved it
    const enhancedTickets = tickets.map(ticket => {
      // Get all responses for this ticket
      const ticketResponses = responses?.filter(r => r.ticket_id === ticket.ticket_id) || [];
      
      // Try to find the admin who resolved this ticket
      let resolvingAdmin = null;
      
      // Use the assigned_to field if available
      if (ticket.assigned_to) {
        // The ticket already has an assigned admin
        resolvingAdmin = ticket.assigned_to;
      } else if (ticketResponses.length > 0) {
        // Try to get the first admin who responded
        const firstAdminResponse = ticketResponses.find(r => r.is_admin && r.admin?.username);
        if (firstAdminResponse) {
          resolvingAdmin = firstAdminResponse.admin.username;
        }
      }
      
      // Return enhanced ticket
      return {
        ...ticket,
        resolving_admin: resolvingAdmin,
      };
    });
    
    return enhancedTickets;
  } catch (error) {
    console.error('Error in getTicketsWithResolutionDetails:', error);
    return [];
  }
};

export const getTicketStats = async (startDate: string, endDate: string): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byBranch: Record<string, number>;
  byStaff: Record<string, number>;
}> => {
  try {
    const tickets = await getTicketsByDateRange(startDate, endDate);
    
    const stats = {
      total: tickets.length,
      byStatus: {} as Record<string, number>,
      byBranch: {} as Record<string, number>,
      byStaff: {} as Record<string, number>
    };
    
    tickets.forEach(ticket => {
      const status = ticket.status || 'unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      const branch = ticket.branch || 'unknown';
      stats.byBranch[branch] = (stats.byBranch[branch] || 0) + 1;
      
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

export const getAdminStats = async (startDate: string, endDate: string): Promise<{
  staffDetails: Array<{
    name: string;
    ticketsCount: number;
    resolvedCount: number;
    averageResponseTime: number;
    responseRate: number;
    statusDistribution: Record<string, number>;
    ticketIds: string[];
  }>;
}> => {
  try {
    // Get all tickets in the date range
    const tickets = await getTicketsByDateRange(startDate, endDate);
    
    // Get all ticket responses 
    const { data: allResponses, error: respError } = await supabase
      .from('ticket_responses')
      .select('*, admin:admins(username)')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });
    
    if (respError) {
      console.error('Error fetching ticket responses:', respError);
      throw respError;
    }
    
    // Map to store admin stats
    const adminStatsMap = new Map();
    
    // Process assigned tickets for each admin
    tickets.forEach(ticket => {
      if (!ticket.assigned_to) return;
      
      const adminName = ticket.assigned_to;
      if (!adminStatsMap.has(adminName)) {
        adminStatsMap.set(adminName, {
          name: adminName,
          ticketsCount: 0,
          resolvedCount: 0,
          responseTimes: [],
          responses: 0,
          statusDistribution: {},
          ticketIds: []
        });
      }
      
      const adminStat = adminStatsMap.get(adminName);
      adminStat.ticketsCount++;
      adminStat.ticketIds.push(ticket.ticket_id);
      
      // Count resolved/closed tickets
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        adminStat.resolvedCount++;
      }
      
      // Add to status distribution
      const status = ticket.status || 'unknown';
      adminStat.statusDistribution[status] = (adminStat.statusDistribution[status] || 0) + 1;
    });
    
    // Process response times
    if (allResponses) {
      // Create a map of first response times for each ticket
      const firstResponseMap = new Map();
      
      allResponses.forEach(response => {
        if (!response.is_admin || !response.admin) return;
        
        const adminName = response.admin.username;
        const ticketId = response.ticket_id;
        
        // Find matching ticket
        const ticket = tickets.find(t => t.ticket_id === ticketId);
        if (!ticket) return;
        
        // If this admin is processing this ticket, count the response
        if (ticket.assigned_to === adminName) {
          // If this is the first response by this admin for this ticket
          if (!firstResponseMap.has(`${adminName}-${ticketId}`)) {
            firstResponseMap.set(`${adminName}-${ticketId}`, true);
            
            // Get response time in hours
            const ticketDate = new Date(ticket.created_at);
            const responseDate = new Date(response.created_at);
            const responseTimeHours = (responseDate.getTime() - ticketDate.getTime()) / (1000 * 60 * 60);
            
            // Get or create admin stats
            if (!adminStatsMap.has(adminName)) {
              adminStatsMap.set(adminName, {
                name: adminName,
                ticketsCount: 0,
                resolvedCount: 0,
                responseTimes: [],
                responses: 0,
                statusDistribution: {},
                ticketIds: []
              });
            }
            
            const adminStat = adminStatsMap.get(adminName);
            adminStat.responseTimes.push(responseTimeHours);
            adminStat.responses++;
          }
        }
      });
    }
    
    // Calculate averages and prepare final result
    const staffDetails = Array.from(adminStatsMap.values()).map(admin => {
      const avgResponseTime = admin.responseTimes.length > 0
        ? admin.responseTimes.reduce((sum, time) => sum + time, 0) / admin.responseTimes.length
        : 0;
      
      const responseRate = admin.ticketsCount > 0
        ? (admin.responses / admin.ticketsCount) * 100
        : 0;
      
      return {
        name: admin.name,
        ticketsCount: admin.ticketsCount,
        resolvedCount: admin.resolvedCount,
        averageResponseTime: avgResponseTime,
        responseRate: responseRate,
        statusDistribution: admin.statusDistribution,
        ticketIds: admin.ticketIds
      };
    });
    
    return { staffDetails };
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    return { staffDetails: [] };
  }
};

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
    const { field_type, ...fieldWithoutType } = field;
    
    const { data, error } = await supabase
      .from('site_fields')
      .insert([fieldWithoutType])
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

export const formatCustomFieldsForDisplay = (ticket: SupportTicket, fields: any[]) => {
  if (!ticket.custom_fields) return [];
  
  const formattedFields = [];
  
  for (const field of fields) {
    const fieldName = field.field_name;
    if (ticket.custom_fields[fieldName]) {
      formattedFields.push({
        display_name: field.display_name,
        value: ticket.custom_fields[fieldName],
        field_type: 'text' // default field type
      });
    }
  }
  
  return formattedFields;
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

    // Then delete the ticket itself
    const { error: ticketError } = await supabase
      .rpc('delete_ticket_by_id', { p_ticket_id: ticketId });

    if (ticketError) {
      console.error('Error calling delete_ticket_by_id function:', ticketError);
      
      // Fallback to direct delete if RPC fails
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('ticket_id', ticketId);
        
      if (error) {
        console.error('Error in fallback ticket deletion:', error);
        return false;
      }
    }
    
    console.log(`Ticket deletion completed`);
    
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
