
import Header from '@/components/Header';
import TicketTracker from '@/components/TicketTracker';
import DateTimeDisplay from '@/components/DateTimeDisplay';

const TicketStatus = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />
      <main className="container px-4 py-8">
        <div className="flex flex-col items-end mb-8">
          <h2 className="text-2xl font-semibold mb-2 text-right">متابعة طلب الدعم الفني</h2>
          <DateTimeDisplay />
        </div>
        <TicketTracker />
      </main>
    </div>
  );
};

export default TicketStatus;
