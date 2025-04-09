
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ChevronRight, Send } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const statusOptions = [
  { value: 'open', label: 'مفتوحة' },
  { value: 'inprogress', label: 'جاري المعالجة' },
  { value: 'resolved', label: 'تم الحل' },
  { value: 'closed', label: 'مغلقة' }
];

const priorityLabels = {
  'urgent': 'عاجلة',
  'medium': 'متوسطة',
  'normal': 'عادية'
};

const priorityColorMap = {
  'urgent': 'bg-red-100 text-red-800',
  'medium': 'bg-orange-100 text-orange-800',
  'normal': 'bg-blue-100 text-blue-800'
};

const AdminTicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const { hasPermission, currentAdmin } = useAdminAuth();

  const canChangeTicketStatus = hasPermission('manage_tickets');
  const canRespondToTickets = hasPermission('respond_to_tickets');

  useEffect(() => {
    if (ticketId) {
      fetchTicketAndResponses();
    }
  }, [ticketId]);

  const fetchTicketAndResponses = async () => {
    setLoading(true);
    try {
      // Fetch ticket details with assigned admin information
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*, assigned_to')
        .eq('ticket_id', ticketId)
        .single();

      if (ticketError) {
        throw ticketError;
      }

      setTicket(ticketData);

      // Get assigned admin details if assigned_to is available
      if (ticketData.assigned_to) {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id, username')
          .eq('username', ticketData.assigned_to)
          .single();
          
        if (!adminError && adminData) {
          setAssignedAdmin(adminData);
        }
      }

      // Fetch ticket responses with admin information
      const { data: responsesData, error: responsesError } = await supabase
        .from('ticket_responses')
        .select('*, admin:admins(username)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (responsesError) {
        throw responsesError;
      }

      // Transform data to include admin username if available
      const formattedResponses = responsesData?.map(response => {
        const adminName = response.admin?.username || null;
        return {
          ...response,
          admin_name: adminName
        };
      }) || [];

      setResponses(formattedResponses);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.error('فشل في تحميل تفاصيل التذكرة');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      toast.error('يرجى إدخال رد');
      return;
    }

    if (!canRespondToTickets) {
      toast.error('ليس لديك صلاحية للرد على التذاكر');
      return;
    }

    if (!currentAdmin) {
      toast.error('لم يتم العثور على بيانات المسؤول');
      return;
    }

    setSendingResponse(true);
    try {
      // Get the admin ID directly from the currentAdmin object
      const adminId = currentAdmin.id;
      
      if (!adminId) {
        throw new Error('لم يتم العثور على معرف المسؤول');
      }

      // If this is the first response and the ticket is not assigned, assign it to the current admin
      if (responses.length === 0 && (!ticket.assigned_to || ticket.assigned_to === '')) {
        // Update the ticket with the assigned admin
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ assigned_to: currentAdmin.username })
          .eq('ticket_id', ticketId);

        if (updateError) {
          console.error('Error assigning ticket:', updateError);
          // Continue anyway as this is not critical
        } else {
          // Update the local state
          setTicket(prev => ({
            ...prev,
            assigned_to: currentAdmin.username
          }));
          setAssignedAdmin(currentAdmin);
        }
      }

      // Add the response
      const { data, error } = await supabase.rpc('add_ticket_response_with_admin', {
        p_ticket_id: ticketId,
        p_response: responseText,
        p_is_admin: true,
        p_admin_id: adminId
      });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      toast.success('تم إرسال الرد بنجاح');
      setResponseText('');
      fetchTicketAndResponses();
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('فشل في إرسال الرد');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (ticket.status === newStatus) return;
    
    if (!canChangeTicketStatus) {
      toast.error('ليس لديك صلاحية لتغيير حالة التذكرة');
      return;
    }

    setUpdatingStatus(true);
    try {
      const { data, error } = await supabase.rpc('update_ticket_status', {
        p_ticket_id: ticketId,
        p_status: newStatus
      });

      if (error) {
        throw error;
      }

      // If the ticket is being resolved or closed, and there's no assigned admin yet, 
      // assign it to the current admin
      if ((newStatus === 'resolved' || newStatus === 'closed') && 
          (!ticket.assigned_to || ticket.assigned_to === '') && 
          currentAdmin) {
        
        const { error: updateError } = await supabase
          .from('tickets')
          .update({ assigned_to: currentAdmin.username })
          .eq('ticket_id', ticketId);

        if (!updateError) {
          setTicket(prev => ({
            ...prev,
            assigned_to: currentAdmin.username
          }));
          setAssignedAdmin(currentAdmin);
        }
      }

      setTicket({ ...ticket, status: newStatus });
      toast.success('تم تحديث حالة التذكرة بنجاح');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('فشل في تحديث حالة التذكرة');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getStatusColorClass = (status) => {
    const statusColorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      open: 'bg-blue-100 text-blue-800',
      inprogress: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    
    return statusColorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getFilteredCustomFields = (ticket) => {
    if (!ticket || !ticket.custom_fields) return {};
    
    const customFields = { ...ticket.custom_fields };
    
    if (customFields.support_email) {
      delete customFields.support_email;
    }
    
    return customFields;
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
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ChevronRight className="h-4 w-4" />
            العودة إلى القائمة
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className={`px-3 py-1 text-xs rounded-full ${getStatusColorClass(ticket?.status)}`}>
                {getStatusLabel(ticket?.status)}
              </div>
              <CardTitle className="text-right">تفاصيل التذكرة #{ticket?.ticket_id}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">تاريخ الإنشاء: {new Date(ticket.created_at).toLocaleDateString('en-US')}</span>
              </div>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex items-center">
                  <span className="ml-2 text-right font-medium">تغيير الحالة:</span>
                  <Select
                    value={ticket.status}
                    onValueChange={handleStatusChange}
                    disabled={updatingStatus || !canChangeTicketStatus}
                  >
                    <SelectTrigger className={`w-36 ml-2 ${!canChangeTicketStatus ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 border rounded-md p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-right font-medium">الرقم الوظيفي:</p>
                  <p className="text-right">{ticket.employee_id}</p>
                </div>
                <div>
                  <p className="text-right font-medium">الفرع:</p>
                  <p className="text-right">{ticket.branch}</p>
                </div>
                <div>
                  <p className="text-right font-medium">الأهمية:</p>
                  <p className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${priorityColorMap[ticket.priority] || 'bg-blue-100 text-blue-800'}`}>
                      {priorityLabels[ticket.priority] || 'عادية'}
                    </span>
                  </p>
                </div>
                {ticket.anydesk_number && (
                  <div>
                    <p className="text-right font-medium">رقم Anydesk:</p>
                    <p className="text-right">{ticket.anydesk_number}</p>
                  </div>
                )}
                {ticket.extension_number && (
                  <div>
                    <p className="text-right font-medium">رقم التحويلة:</p>
                    <p className="text-right">{ticket.extension_number}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-right font-medium">موظف الدعم المسؤول:</p>
                  <p className="text-right">
                    {ticket.assigned_to ? (
                      <span className="font-medium text-company">{ticket.assigned_to}</span>
                    ) : (
                      <span className="text-gray-500">لم يتم التعيين</span>
                    )}
                  </p>
                </div>
                
                {Object.entries(getFilteredCustomFields(ticket)).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-right font-medium">{key}:</p>
                    <p className="text-right">{String(value)}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-right font-medium">وصف المشكلة:</p>
                <div className="p-3 bg-white rounded border mt-2 text-right">
                  {ticket.description}
                </div>
              </div>

              {ticket.image_url && (
                <div>
                  <p className="text-right font-medium">الصورة المرفقة:</p>
                  <div className="flex justify-center mt-2">
                    <img 
                      src={ticket.image_url} 
                      alt="صورة مرفقة" 
                      className="max-w-full max-h-96 object-contain rounded border"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-right">الردود</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {responses.length > 0 ? (
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <div 
                    key={response.id} 
                    className={`p-4 rounded-lg ${
                      response.is_admin 
                        ? 'bg-company-light border border-company/20 ml-8' 
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500">
                        {new Date(response.created_at).toLocaleString('ar-SA')}
                      </span>
                      <span className="font-medium">
                        {response.is_admin 
                          ? response.admin_name || 'الدعم الفني' 
                          : 'الموظف'}
                      </span>
                    </div>
                    <p className="text-right">{response.response}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                لا توجد ردود بعد
              </div>
            )}

            <Separator className="my-4" />

            {canRespondToTickets ? (
              <div className="space-y-4">
                <p className="text-right font-medium">إضافة رد:</p>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="اكتب رداً على هذه التذكرة..."
                  className="min-h-[100px] text-right"
                  dir="rtl"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSendResponse}
                    disabled={sendingResponse || !responseText.trim() || !canRespondToTickets}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    إرسال الرد
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 border rounded-md p-4">
                ليس لديك صلاحية للرد على التذاكر
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminTicketDetails;
