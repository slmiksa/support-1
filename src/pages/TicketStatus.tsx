
import Header from '@/components/Header';
import TicketTracker from '@/components/TicketTracker';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { findTicketById, SupportTicket } from '@/utils/ticketUtils';
import { useToast } from '@/hooks/use-toast';

const TicketStatus = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (ticketId) {
      fetchTicket(ticketId);
    }
  }, [ticketId]);

  const fetchTicket = async (id: string) => {
    try {
      setLoading(true);
      const fetchedTicket = await findTicketById(id);
      
      if (fetchedTicket) {
        setTicket(fetchedTicket);
      } else {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على الطلب",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب بيانات الطلب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-pattern-light">
      <Header />
      <main className="container px-4 py-8">
        <div className="flex flex-col items-end mb-8 bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-right text-company">متابعة طلب الدعم الفني</h2>
          <div className="w-40 h-1 bg-accent-gold mb-4"></div>
          <DateTimeDisplay />
        </div>
        <TicketTracker />
      </main>
    </div>
  );
};

export default TicketStatus;
