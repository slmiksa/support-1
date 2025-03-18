
import { useState, FormEvent, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface TicketResponse {
  id: string;
  ticket_id: string;
  response: string;
  is_admin: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  ticket_id: string;
  employee_id: string;
  branch: string;
  anydesk_number?: string;
  extension_number?: string;
  description: string;
  image_url?: string;
  status: 'pending' | 'open' | 'inprogress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

const statusLabels = {
  pending: 'قيد الانتظار',
  open: 'مفتوحة',
  inprogress: 'جاري المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلقة',
};

const TicketTracker = () => {
  const [ticketId, setTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!ticketId) {
      toast.error('الرجاء إدخال رقم الطلب');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch ticket by ticket_id
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();
      
      if (ticketError) {
        if (ticketError.code === 'PGRST116') {
          toast.error('لم يتم العثور على طلب بهذا الرقم');
        } else {
          throw ticketError;
        }
        setTicket(null);
        setResponses([]);
        return;
      }
      
      // Cast the status to ensure type compatibility
      setTicket({
        ...ticketData,
        status: ticketData.status as 'pending' | 'open' | 'inprogress' | 'resolved' | 'closed'
      });
      
      // Fetch responses for this ticket
      const { data: responsesData, error: responsesError } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (responsesError) {
        throw responsesError;
      }
      
      setResponses(responsesData || []);
    } catch (error) {
      console.error('Error finding ticket:', error);
      toast.error('حدث خطأ أثناء البحث عن الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      <Card className="border-company/20 glass mb-6">
        <CardHeader>
          <CardTitle className="text-right">متابعة طلب الدعم</CardTitle>
          <CardDescription className="text-right">
            أدخل رقم الطلب للاطلاع على حالته ورد الدعم الفني
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="ticket-id" className="text-right">رقم الطلب</Label>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="loader"></div>
                  ) : 'بحث'}
                </Button>
                <Input
                  id="ticket-id"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="أدخل رقم الطلب (مثال: wsl-abc123)"
                  className="flex-1 text-right"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {ticket && (
        <Card className="border-company/20 glass animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className={`px-3 py-1 text-xs rounded-full ${
                ticket.status === 'resolved' || ticket.status === 'closed'
                  ? 'bg-green-100 text-green-800' 
                  : ticket.status === 'inprogress'
                  ? 'bg-purple-100 text-purple-800'
                  : ticket.status === 'open'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {statusLabels[ticket.status] || ticket.status}
              </div>
              <CardTitle className="text-right">تفاصيل الطلب</CardTitle>
            </div>
            <CardDescription className="text-right">
              تاريخ تقديم الطلب: {new Date(ticket.created_at).toLocaleDateString('ar-SA')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-b pb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-right font-medium">الرقم الوظيفي:</div>
                <div className="text-right">{ticket.employee_id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-right font-medium">الفرع:</div>
                <div className="text-right">{ticket.branch}</div>
              </div>
              {ticket.anydesk_number && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-right font-medium">رقم Anydesk:</div>
                  <div className="text-right">{ticket.anydesk_number}</div>
                </div>
              )}
              {ticket.extension_number && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-right font-medium">رقم التحويلة:</div>
                  <div className="text-right">{ticket.extension_number}</div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-right font-medium">وصف المشكلة:</div>
              <div className="p-3 bg-muted rounded text-right">{ticket.description}</div>
            </div>
            
            {ticket.image_url && (
              <div className="space-y-2">
                <div className="text-right font-medium">الصورة المرفقة:</div>
                <div className="flex justify-center">
                  <img 
                    src={ticket.image_url} 
                    alt="صورة مرفقة" 
                    className="max-w-full max-h-48 object-contain rounded border border-border"
                  />
                </div>
              </div>
            )}
            
            {responses.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="text-right font-medium text-company">ردود الدعم الفني:</div>
                <div className="space-y-2">
                  {responses.filter(r => r.is_admin).map((response) => (
                    <div 
                      key={response.id} 
                      className="p-4 bg-company-light rounded-md border border-company/20 text-right"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">
                          {new Date(response.created_at).toLocaleString('ar-SA')}
                        </span>
                        <span className="font-medium">الدعم الفني</span>
                      </div>
                      <p>{response.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketTracker;
