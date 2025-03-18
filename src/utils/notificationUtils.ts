
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket } from './ticketUtils';
import { toast } from 'sonner';

// Send email notification to admin when a new ticket is created
export const sendTicketNotification = async (
  ticket: SupportTicket, 
  adminEmail: string
): Promise<boolean> => {
  try {
    // Prepare the notification data
    const notificationData = {
      ticket_id: ticket.ticket_id,
      employee_id: ticket.employee_id,
      branch: ticket.branch,
      description: ticket.description,
      admin_email: adminEmail
    };

    // Call the Supabase edge function to send the email
    const { data, error } = await supabase.functions.invoke(
      'send-ticket-notification',
      {
        body: notificationData
      }
    );

    if (error) {
      console.error('Error sending ticket notification:', error);
      return false;
    }

    console.log('Notification sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending ticket notification:', error);
    return false;
  }
};

// Fetch admin emails from the database
export const getAdminEmails = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('username, notification_email')
      .eq('role', 'super_admin')
      .or('role.eq.admin');

    if (error) {
      throw error;
    }

    // Use notification_email if available, otherwise use username (which is the email)
    return data.map(admin => admin.notification_email || admin.username).filter(Boolean);
  } catch (error) {
    console.error('Error fetching admin emails:', error);
    return [];
  }
};

// Save admin notification email
export const saveAdminNotificationEmail = async (
  adminId: string,
  notificationEmail: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admins')
      .update({ notification_email: notificationEmail })
      .eq('id', adminId);

    if (error) {
      console.error('Error saving notification email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving notification email:', error);
    return false;
  }
};
