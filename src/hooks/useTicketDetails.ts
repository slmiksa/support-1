
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
        .select('*, assigned_to')
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

      // Fetch admin data if ticket is assigned
      if (ticketData.assigned_to) {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id, username')
          .eq('username', ticketData.assigned_to)
          .single();
          
        if (!adminError && adminData) {
          setAssignedAdmin(adminData);
        }
      }

      console.log('Fetching responses from database...');
      // Use a separate query to ensure we get the most up-to-date responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('ticket_responses')
        .select('*, admin:admins(username)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (responsesError) {
        throw responsesError;
      }

      console.log('Responses received:', responsesData?.length || 0);
      
      // Format responses for display
      const formattedResponses = responsesData?.map(response => {
        const adminName = response.admin?.username || null;
        return {
          ...response,
          admin_name: adminName
        };
      }) || [];

      setResponses(formattedResponses);
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
