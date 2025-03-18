
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { findTicketById, simulateTicketResponse, SupportTicket } from '../utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TicketTracker = () => {
  const [ticketId, setTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!ticketId) {
      toast.error('الرجاء إدخال رقم الطلب');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Find ticket by ID
      const foundTicket = findTicketById(ticketId);
      
      if (!foundTicket) {
        toast.error('لم يتم العثور على طلب بهذا الرقم');
        setTicket(null);
        return;
      }
      
      // If ticket exists but doesn't have a response yet, simulate a response
      if (!foundTicket.response) {
        simulateTicketResponse(ticketId);
        const updatedTicket = findTicketById(ticketId);
        setTicket(updatedTicket || null);
      } else {
        setTicket(foundTicket);
      }
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
                ticket.status === 'resolved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {ticket.status === 'resolved' ? 'تم الرد' : 'في انتظار الرد'}
              </div>
              <CardTitle className="text-right">تفاصيل الطلب</CardTitle>
            </div>
            <CardDescription className="text-right">
              تاريخ تقديم الطلب: {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-b pb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-right font-medium">الرقم الوظيفي:</div>
                <div className="text-right">{ticket.employeeId}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-right font-medium">الفرع:</div>
                <div className="text-right">{ticket.branch}</div>
              </div>
              {ticket.anydeskNumber && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-right font-medium">رقم Anydesk:</div>
                  <div className="text-right">{ticket.anydeskNumber}</div>
                </div>
              )}
              {ticket.extensionNumber && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-right font-medium">رقم التحويلة:</div>
                  <div className="text-right">{ticket.extensionNumber}</div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-right font-medium">وصف المشكلة:</div>
              <div className="p-3 bg-muted rounded text-right">{ticket.description}</div>
            </div>
            
            {ticket.imageUrl && (
              <div className="space-y-2">
                <div className="text-right font-medium">الصورة المرفقة:</div>
                <div className="flex justify-center">
                  <img 
                    src={ticket.imageUrl} 
                    alt="صورة مرفقة" 
                    className="max-w-full max-h-48 object-contain rounded border border-border"
                  />
                </div>
              </div>
            )}
            
            {ticket.response && (
              <div className="mt-6 space-y-2">
                <div className="text-right font-medium text-company">رد الدعم الفني:</div>
                <div className="p-4 bg-company-light rounded-md border border-company/20 text-right">
                  {ticket.response}
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
