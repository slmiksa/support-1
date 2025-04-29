
import { Separator } from '@/components/ui/separator';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface TicketResponse {
  id: string;
  response: string;
  is_admin?: boolean;
  created_at: string;
  admin_name?: string | null;
  admin_employee_id?: string | null;
  // Add missing properties to match database schema
  ticket_id: string;
  admin_id?: string | null;
  private?: boolean | null;
  admin?: { 
    username?: string | null; 
    employee_id?: string | null;
    id?: string | null;
  } | null;
}

interface TicketResponseListProps {
  responses: TicketResponse[];
  isCustomerView?: boolean; // New prop to control visibility
}

const TicketResponseList = ({ responses, isCustomerView = false }: TicketResponseListProps) => {
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
            <div className="text-right">
              <span className="font-medium dark:text-white">
                {response.is_admin 
                  ? response.admin_name || 'الدعم الفني' 
                  : 'الموظف'}
              </span>
              {response.is_admin && response.admin_employee_id && !isCustomerView && (
                <div className="text-xs text-gray-500 mt-1">
                  عضوية: {response.admin_employee_id}
                </div>
              )}
            </div>
          </div>
          <p className="text-right dark:text-white">{response.response}</p>
        </div>
      ))}
    </div>
  );
};

export default TicketResponseList;
