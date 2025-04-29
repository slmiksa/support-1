
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useTicketDetails = (ticketId: string | undefined) => {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [assignedAdmin, setAssignedAdmin] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const fetchTicketAndResponses = async () => {
    if (!ticketId) return;
    
    console.log('Fetching fresh data for ticket and responses...');
    setLoading(true);
    try {
      // Fetch ticket data
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();

      if (ticketError) {
        throw ticketError;
      }

      // If the ticket status is 'pending', update it to 'open' automatically
      if (ticketData.status === 'pending') {
        const { error: updateError } = await supabase.rpc('update_ticket_status', {
          p_ticket_id: ticketId,
          p_status: 'open'
        });
        
        if (!updateError) {
          // Update local state with the new status
          ticketData.status = 'open';
          toast.success('تم تحديث حالة التذكرة إلى مفتوحة');
        } else {
          console.error('Error updating ticket status:', updateError);
        }
      }

      setTicket(ticketData);

      // Fetch responses to identify the first admin who responded
      console.log('Fetching responses from database...');
      const { data: responsesData, error: responsesError } = await supabase
        .from('ticket_responses')
        .select('*, admin:admins(username, employee_id, id)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (responsesError) {
        throw responsesError;
      }

      console.log('Responses received:', responsesData?.length || 0);
      
      // Format responses for display
      const formattedResponses = responsesData?.map(response => {
        const adminName = response.admin?.username || null;
        const adminEmployeeId = response.admin?.employee_id || null;
        return {
          ...response,
          admin_name: adminName,
          admin_employee_id: adminEmployeeId,
          is_admin: response.is_admin !== undefined ? response.is_admin : true // Default to true if not set
        };
      }) || [];

      setResponses(formattedResponses);
      
      // Automatically set the assigned admin if not already assigned
      if (ticketData && !ticketData.assigned_to && formattedResponses.length > 0) {
        // Find the first admin response
        const firstAdminResponse = formattedResponses.find(resp => 
          (resp.is_admin !== undefined ? resp.is_admin : true) && resp.admin_name);
        
        if (firstAdminResponse) {
          // Update the ticket's assigned_to field
          const { error: assignError } = await supabase
            .from('tickets')
            .update({ assigned_to: firstAdminResponse.admin_name })
            .eq('ticket_id', ticketId);
            
          if (!assignError) {
            // Update local state
            ticketData.assigned_to = firstAdminResponse.admin_name;
            console.log(`Ticket assigned to ${firstAdminResponse.admin_name} automatically`);
          } else {
            console.error('Error assigning ticket to admin:', assignError);
          }
        }
      }

      // Fetch admin data if ticket is assigned
      if (ticketData && ticketData.assigned_to) {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id, username, employee_id')
          .eq('username', ticketData.assigned_to)
          .single();
          
        if (!adminError && adminData) {
          setAssignedAdmin(adminData);
        }
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.error('فشل في تحميل تفاصيل التذكرة');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (ticket) {
      setTicket({ ...ticket, status: newStatus });
    }
  };

  const setUpdatingStatusState = (isUpdating: boolean) => {
    setUpdatingStatus(isUpdating);
  };

  // Fetch data when ticketId changes
  useEffect(() => {
    if (ticketId) {
      fetchTicketAndResponses();
    }
  }, [ticketId]);

  return {
    ticket,
    responses,
    loading,
    assignedAdmin,
    updatingStatus,
    fetchTicketAndResponses,
    handleStatusChange,
    setUpdatingStatusState
  };
};
