
import Header from '@/components/Header';
import SupportForm from '@/components/SupportForm';
import DateTimeDisplay from '@/components/DateTimeDisplay';

const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-pattern-light">
      <Header />
      <main className="container px-4 py-8">
        <div className="flex flex-col items-end mb-8 bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-right text-company">نظام الدعم الفني</h2>
          <div className="w-28 h-1 bg-accent-gold mb-4"></div>
          <DateTimeDisplay />
        </div>
        <SupportForm />
      </main>
    </div>
  );
};

export default Index;
