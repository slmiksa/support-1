
import { Separator } from '@/components/ui/separator';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TicketResponse {
  id: string;
  response: string;
  is_admin: boolean;
  created_at: string;
  admin_name?: string | null;
}

interface TicketResponseListProps {
  responses: TicketResponse[];
  onDeleteResponse?: (responseId: string) => void;
}

const TicketResponseList = ({ responses, onDeleteResponse }: TicketResponseListProps) => {
  const { hasPermission } = useAdminAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const handleDeleteResponse = async (responseId: string) => {
    if (!responseId) return;
    
    try {
      setDeletingId(responseId);
      
      // Delete the response from the database
      const { error } = await supabase
        .from('ticket_responses')
        .delete()
        .eq('id', responseId);
      
      if (error) {
        throw error;
      }
      
      // Call the callback to update the parent component state
      if (onDeleteResponse) {
        onDeleteResponse(responseId);
      }
      
      toast.success('تم حذف الرد بنجاح');
    } catch (error) {
      console.error('Error deleting response:', error);
      toast.error('حدث خطأ أثناء حذف الرد');
    } finally {
      setDeletingId(null);
    }
  };
  
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(response.created_at).toLocaleString('ar-SA')}
              </span>
              
              {hasPermission('manage_tickets') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:text-red-300"
                  onClick={() => handleDeleteResponse(response.id)}
                  disabled={deletingId === response.id}
                  title="حذف الرد"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">حذف الرد</span>
                </Button>
              )}
            </div>
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
