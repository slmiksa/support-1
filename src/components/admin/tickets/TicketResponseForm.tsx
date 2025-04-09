
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

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

      if (responses.length === 0 && (!ticket.assigned_to || ticket.assigned_to === '')) {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ assigned_to: currentAdmin.username })
          .eq('ticket_id', ticketId);

        if (updateError) {
          console.error('Error assigning ticket:', updateError);
        } else {
          ticket.assigned_to = currentAdmin.username;
        }
      }

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
