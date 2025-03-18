
import Header from '@/components/Header';
import SupportForm from '@/components/SupportForm';
import DateTimeDisplay from '@/components/DateTimeDisplay';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container px-4 py-4 mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-center text-[#222222] mb-6">نظام الدعم الفني</h2>
            <DateTimeDisplay />
          </div>
        </div>
        <SupportForm />
      </main>
    </div>
  );
};

export default Index;
