
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { sendTicketNotification } from '@/utils/notificationUtils';
import { SupportTicket } from '@/utils/ticketUtils';

interface TicketResponseFormProps {
  ticketId: string;
  ticket: any;
  currentAdmin: any;
  responses: any[];
  onResponseSubmitted: () => void;
  canRespond: boolean;
}

const TicketResponseForm = ({
  ticketId,
  ticket,
  currentAdmin,
  responses,
  onResponseSubmitted,
  canRespond
}: TicketResponseFormProps) => {
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      toast.error('يرجى إدخال رد');
      return;
    }

    if (!canRespond) {
      toast.error('ليس لديك صلاحية للرد على التذاكر');
      return;
    }

    if (!currentAdmin) {
      toast.error('لم يتم العثور على بيانات المسؤول');
      return;
    }

    setSendingResponse(true);
    try {
      const adminId = currentAdmin.id;
      
      if (!adminId) {
        throw new Error('لم يتم العثور على معرف المسؤول');
      }

      // الرد سيتم تخزينه وسيتم تعيين المسؤول تلقائياً في hook الخاص بالتذكرة
      const { data, error } = await supabase.rpc('add_ticket_response_with_admin', {
        p_ticket_id: ticketId,
        p_response: responseText,
        p_is_admin: true,
        p_admin_id: adminId
      });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      // Try to send an email notification if there's a customer email attached to the ticket
      // During testing mode, always send to trndsky@gmail.com
      try {
        // For testing purposes, send all notifications to trndsky@gmail.com
        const notificationEmail = 'trndsky@gmail.com';
        console.log('Sending response notification to:', notificationEmail);
        
        // Create a simple ticket-like object for the notification function
        const ticketData: SupportTicket = {
          ticket_id: ticketId,
          branch: ticket.branch || '',
          priority: ticket.priority || 'normal',
          description: responseText, // Use the response as the description
          image_url: null,
          status: ticket.status || 'pending',
          created_at: new Date().toISOString(),
          employee_id: '',
          custom_fields: {},
          anydesk_number: '',
          customer_email: notificationEmail,
          support_email: 'help@alwaslsaudi.com',
          extension_number: ''
        };
        
        await sendTicketNotification(ticketData, notificationEmail, null, 'دعم الوصل');
      } catch (notifyError) {
        // Just log the error, don't fail the entire response operation
        console.error('Failed to send notification about response:', notifyError);
      }

      toast.success('تم إرسال الرد بنجاح');
      setResponseText('');
      onResponseSubmitted();
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('فشل في إرسال الرد');
    } finally {
      setSendingResponse(false);
    }
  };

  if (!canRespond) {
    return (
      <>
        <Separator className="my-4" />
        <div className="text-center py-4 text-gray-500 border rounded-md p-4">
          ليس لديك صلاحية للرد على التذاكر
        </div>
      </>
    );
  }

  return (
    <>
      <Separator className="my-4" />
      <div className="space-y-4">
        <p className="text-right font-medium">إضافة رد:</p>
        <Textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="اكتب رداً على هذه التذكرة..."
          className="min-h-[100px] text-right"
          dir="rtl"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSendResponse}
            disabled={sendingResponse || !responseText.trim()}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            إرسال الرد
          </Button>
        </div>
      </div>
    </>
  );
};

export default TicketResponseForm;
