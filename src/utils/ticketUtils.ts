
import { supabase } from '@/integrations/supabase/client';

// Generate a unique ticket ID with wsl- prefix
export const generateTicketId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `wsl-${timestamp}${randomStr}`.substring(0, 12);
};

export interface SupportTicket {
  id?: string;
  ticket_id: string;
  employee_id: string;
  branch: string;
  anydesk_number?: string;
  extension_number?: string;
  description: string;
  image_file?: File | null;
  image_url?: string;
  status: 'pending' | 'open' | 'inprogress' | 'resolved' | 'closed';
  created_at?: string;
  updated_at?: string;
  response?: string;
}

// Save ticket to Supabase
export const saveTicket = async (ticket: SupportTicket): Promise<{ success: boolean; ticket_id?: string; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          ticket_id: ticket.ticket_id,
          employee_id: ticket.employee_id,
          branch: ticket.branch,
          anydesk_number: ticket.anydesk_number,
          extension_number: ticket.extension_number,
          description: ticket.description,
          image_url: ticket.image_url,
          status: ticket.status,
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, ticket_id: ticket.ticket_id };
  } catch (error) {
    console.error('Error saving ticket:', error);
    return { success: false, error };
  }
};

// Legacy function to support the transition from localStorage to Supabase
// This will be kept for backward compatibility
export const getStoredTickets = (): SupportTicket[] => {
  const STORAGE_KEY = 'wsl_support_tickets';
  const storedTickets = localStorage.getItem(STORAGE_KEY);
  return storedTickets ? JSON.parse(storedTickets) : [];
};

// Legacy function to support the transition from localStorage to Supabase
export const findTicketById = async (ticketId: string): Promise<SupportTicket | undefined> => {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', ticketId)
      .single();

    if (error) {
      // Check localStorage as fallback for old tickets
      const localTickets = getStoredTickets();
      return localTickets.find(ticket => ticket.ticket_id === ticketId);
    }

    // Cast the status to ensure type compatibility
    return {
      ...data,
      status: data.status as 'pending' | 'open' | 'inprogress' | 'resolved' | 'closed'
    };
  } catch (error) {
    console.error('Error finding ticket:', error);
    return undefined;
  }
};

// Legacy function to support the transition from localStorage to Supabase
export const updateTicket = async (
  ticketId: string, 
  updates: Partial<SupportTicket>
): Promise<boolean> => {
  try {
    // Convert any date fields from number to string if necessary
    const supabaseUpdates: any = {};
    
    // Copy all fields except created_at/updated_at which need special handling
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'created_at' && key !== 'updated_at') {
        supabaseUpdates[key] = value;
      }
    });
    
    const { error } = await supabase
      .from('tickets')
      .update(supabaseUpdates)
      .eq('ticket_id', ticketId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating ticket:', error);
    
    // Fallback to local storage
    const tickets = getStoredTickets();
    const ticketIndex = tickets.findIndex(ticket => ticket.ticket_id === ticketId);
    
    if (ticketIndex === -1) return false;
    
    tickets[ticketIndex] = { ...tickets[ticketIndex], ...updates };
    localStorage.setItem('wsl_support_tickets', JSON.stringify(tickets));
    return true;
  }
};

// Legacy function - simulating a response is no longer needed with the admin panel
export const simulateTicketResponse = async (ticketId: string): Promise<boolean> => {
  const responses = [
    "تم استلام طلبك وسنقوم بالتواصل معك قريباً",
    "نعمل حالياً على حل المشكلة، يرجى المحاولة مرة أخرى بعد ساعة",
    "تم حل المشكلة، يرجى إعادة تشغيل الجهاز والتأكد من عمل التطبيق",
    "سيقوم الفني بالتواصل معك خلال 30 دقيقة",
    "تم إرسال الحل على بريدك الإلكتروني، يرجى التحقق"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  try {
    // Add a response to the ticket
    const { data, error } = await supabase.rpc('add_ticket_response', {
      p_ticket_id: ticketId,
      p_response: randomResponse,
      p_is_admin: true
    });

    if (error) {
      throw error;
    }

    // Also update the ticket status
    await supabase.rpc('update_ticket_status', {
      p_ticket_id: ticketId,
      p_status: 'resolved'
    });

    return true;
  } catch (error) {
    console.error('Error simulating response:', error);
    
    // Fallback to local storage
    return updateTicket(ticketId, { 
      response: randomResponse,
      status: 'resolved'
    });
  }
};
