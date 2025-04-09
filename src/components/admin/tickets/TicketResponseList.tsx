
import { Separator } from '@/components/ui/separator';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface TicketResponse {
  id: string;
  response: string;
  is_admin: boolean;
  created_at: string;
  admin_name?: string | null;
}

interface TicketResponseListProps {
  responses: TicketResponse[];
}

const TicketResponseList = ({ responses }: TicketResponseListProps) => {
  const { hasPermission } = useAdminAuth();
  
  if (responses.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        لا توجد ردود بعد
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <div 
          key={response.id} 
          className={`p-4 rounded-lg ${
            response.is_admin 
              ? 'bg-company-light border border-company/20 ml-8 dark:bg-gray-700/50 dark:border-company/30' 
              : 'bg-gray-100 mr-8 dark:bg-gray-800 dark:text-white'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(response.created_at).toLocaleString('ar-SA')}
            </span>
            <span className="font-medium dark:text-white">
              {response.is_admin 
                ? response.admin_name || 'الدعم الفني' 
                : 'الموظف'}
            </span>
          </div>
          <p className="text-right dark:text-white">{response.response}</p>
        </div>
      ))}
    </div>
  );
};

export default TicketResponseList;
