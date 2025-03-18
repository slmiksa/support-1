
import Header from '@/components/Header';
import TicketTracker from '@/components/TicketTracker';
import DateTimeDisplay from '@/components/DateTimeDisplay';

const TicketStatus = () => {
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
