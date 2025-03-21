
import { supabase, PriorityType } from '@/integrations/supabase/client';
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
      priority: ticket.priority,
      description: ticket.description,
      admin_email: adminEmail,
      // Use the support_email from the ticket if available, otherwise use the default
      support_email: ticket.support_email || 'help@alwaslsaudi.com'
    };

    console.log('Sending notification for ticket', ticket.ticket_id, 'to', adminEmail);
    console.log('Using support email:', notificationData.support_email);

    // Call the Supabase edge function to send the email
    const { data, error } = await supabase.functions.invoke(
      'send-ticket-notification',
      {
        body: notificationData
      }
    );

    if (error) {
      console.error('Error sending ticket notification:', error);
      // Silently log error but don't show toast
      return false;
    }

    console.log('Notification sent successfully:', data);
    // Success toast is still shown only to admins
    return true;
  } catch (error) {
    console.error('Error sending ticket notification:', error);
    // Silently log error but don't show toast
    return false;
  }
};

// Send email notifications to all admins when a new ticket is created
export const sendTicketNotificationsToAllAdmins = async (
  ticket: SupportTicket
): Promise<boolean> => {
  try {
    // Get all admin emails
    const adminEmails = await getAdminEmails();
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails found. Skipping notifications.');
      return false;
    }
    
    console.log('Sending notifications to admins:', adminEmails);
    
    // Send notifications to all admins
    const results = await Promise.allSettled(
      adminEmails.map(email => sendTicketNotification(ticket, email))
    );
    
    // Check if at least one notification was sent successfully
    const atLeastOneSuccess = results.some(
      result => result.status === 'fulfilled' && result.value === true
    );
    
    return atLeastOneSuccess;
  } catch (error) {
    console.error('Error sending notifications to admins:', error);
    return false;
  }
};

// Fetch admin emails from the database
export const getAdminEmails = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('username, notification_email')
      .or('role.eq.super_admin,role.eq.admin');

    if (error) {
      console.error('Error fetching admin emails:', error);
      throw error;
    }

    // Use notification_email if available, otherwise use username (which is the email)
    const emails = data
      .map(admin => admin.notification_email || admin.username)
      .filter(Boolean);
    
    console.log('Found admin emails:', emails);
    return emails;
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
