
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TicketTrackerProps {
  onSearchTicket?: (ticketId: string) => void;
}

const TicketTracker = ({ onSearchTicket }: TicketTrackerProps) => {
  const [ticketId, setTicketId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!ticketId) {
      toast.error('الرجاء إدخال رقم الطلب');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (onSearchTicket) {
        onSearchTicket(ticketId);
      } else {
        // Default functionality if no onSearchTicket is provided
        window.location.href = `/ticket-status/${ticketId}`;
      }
    } catch (error) {
      console.error('Error searching ticket:', error);
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
    </div>
  );
};

export default TicketTracker;
