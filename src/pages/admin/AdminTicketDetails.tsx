
import { useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useTicketDetails } from '@/hooks/useTicketDetails';
import TicketDetailsCard from '@/components/admin/tickets/TicketDetailsCard';
import TicketResponseList from '@/components/admin/tickets/TicketResponseList';
import TicketResponseForm from '@/components/admin/tickets/TicketResponseForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AdminTicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { hasPermission, currentAdmin } = useAdminAuth();
  
  const {
    ticket,
    responses,
    loading,
    assignedAdmin,
    updatingStatus,
    fetchTicketAndResponses,
    handleStatusChange,
    setUpdatingStatusState
  } = useTicketDetails(ticketId);

  const canChangeTicketStatus = hasPermission('manage_tickets');
  const canRespondToTickets = hasPermission('respond_to_tickets');
  const canDeleteTicket = hasPermission('manage_tickets');

  const handleDeleteTicket = async () => {
    if (!ticketId) return;
    
    try {
      console.log(`Attempting to delete ticket ${ticketId}`);
      
      // First, delete all responses for this ticket
      const { error: responseError } = await supabase
        .from('ticket_responses')
        .delete()
        .eq('ticket_id', ticketId);
        
      if (responseError) {
        console.error('Error deleting ticket responses:', responseError);
        throw responseError;
      }
      
      // Then delete the ticket itself
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('ticket_id', ticketId);
        
      if (error) {
        console.error('Error deleting ticket:', error);
        throw error;
      }
      
      toast.success('تم حذف التذكرة بنجاح');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('فشل في حذف التذكرة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2">جاري تحميل بيانات التذكرة...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-10">
              <p>التذكرة غير موجودة</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/admin/dashboard')}
              >
                العودة إلى القائمة
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            {canDeleteTicket && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    حذف التذكرة
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-right">تأكيد حذف التذكرة</AlertDialogTitle>
                    <AlertDialogDescription className="text-right">
                      هل أنت متأكد من رغبتك في حذف هذه التذكرة؟ هذا الإجراء لا يمكن التراجع عنه.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse">
                    <AlertDialogAction onClick={handleDeleteTicket} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      نعم، حذف التذكرة
                    </AlertDialogAction>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ChevronRight className="h-4 w-4" />
            العودة إلى القائمة
          </Button>
        </div>

        <TicketDetailsCard 
          ticket={ticket}
          assignedAdmin={assignedAdmin}
          canChangeTicketStatus={canChangeTicketStatus}
          handleStatusChange={handleStatusChange}
          updatingStatus={updatingStatus}
          currentAdmin={currentAdmin}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-right">الردود</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TicketResponseList responses={responses} />
            
            <TicketResponseForm
              ticketId={ticketId || ''}
              ticket={ticket}
              currentAdmin={currentAdmin}
              responses={responses}
              onResponseSubmitted={fetchTicketAndResponses}
              canRespond={canRespondToTickets}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminTicketDetails;
