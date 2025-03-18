
import Header from '@/components/Header';
import SupportForm from '@/components/SupportForm';
import DateTimeDisplay from '@/components/DateTimeDisplay';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container px-4 py-4 mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col items-end">
            <h2 className="text-2xl font-semibold text-right text-company mb-1">نظام الدعم الفني</h2>
            <div className="w-28 h-1 bg-accent-gold mb-6"></div>
            <DateTimeDisplay />
          </div>
        </div>
        <SupportForm />
      </main>
    </div>
  );
};

export default Index;
