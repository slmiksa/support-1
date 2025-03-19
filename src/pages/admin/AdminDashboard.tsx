
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, X, Flag, AlertTriangle, CircleCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// Define ticket status color map with more vibrant colors
const statusColorMap = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200',
  open: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200',
  inprogress: 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200',
  resolved: 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200',
  closed: 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200',
};

// Define priority color map
const priorityColorMap = {
  urgent: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200',
  medium: 'bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200',
  normal: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200',
};

// Define priority icons
const priorityIconMap = {
  urgent: <Flag className="h-4 w-4 mr-1" />,
  medium: <AlertTriangle className="h-4 w-4 mr-1" />,
  normal: <CircleCheck className="h-4 w-4 mr-1" />,
};

// Define ticket status labels in Arabic
const statusLabels = {
  pending: 'قيد الانتظار',
  open: 'مفتوحة',
  inprogress: 'جاري المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلقة',
};

// Define priority labels in Arabic
const priorityLabels = {
  urgent: 'عاجلة',
  medium: 'متوسطة',
  normal: 'عادية',
};

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
      setupRealtimeSubscription();
    }
  }, [isAuthenticated]);

  const setupRealtimeSubscription = () => {
    // Subscribe to realtime updates for the tickets table
    const channel = supabase
      .channel('admin-dashboard-tickets')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'tickets' 
      }, (payload) => {
        // Handle new ticket
        const newTicket = payload.new;
        
        // Show toast notification for new ticket with more details
        toast.success(
          <div className="rtl">
            <div className="font-bold">تذكرة جديدة</div>
            <div>تم استلام تذكرة جديدة: {newTicket.ticket_id}</div>
            <div>الفرع: {newTicket.branch}</div>
            <div>الأهمية: {priorityLabels[newTicket.priority] || 'عادية'}</div>
            <div>الموظف: {newTicket.employee_id}</div>
          </div>,
          {
            duration: 10000, // Increase duration to 10 seconds to make sure admins notice it
            position: 'top-left',
            action: {
              label: 'عرض',
              onClick: () => navigate(`/admin/tickets/${newTicket.ticket_id}`),
            },
          }
        );
        
        // Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Could not play notification sound:', e));
        } catch (e) {
          console.log('Error playing notification sound:', e);
        }
        
        // Update tickets state with the new ticket
        setTickets(prevTickets => {
          // Add the new ticket to the beginning of the array
          return [newTicket, ...prevTickets];
        });
      })
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('فشل في تحميل التذاكر');
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === activeFilter);
    }
    
    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.ticket_id.toLowerCase().includes(query) ||
        ticket.employee_id.toLowerCase().includes(query) ||
        ticket.branch.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/tickets/${ticketId}`);
  };

  const getPriorityDisplay = (priority) => {
    // Default to normal if not specified
    const actualPriority = priority || 'normal';
    return (
      <Badge className={`font-medium px-3 py-1 rounded-md text-sm flex items-center ${priorityColorMap[actualPriority] || 'bg-green-100'}`}>
        {priorityIconMap[actualPriority]}
        {priorityLabels[actualPriority] || 'عادية'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-6">
        <Card className="shadow-md border-company-light">
          <CardHeader className="pb-3 bg-gradient-primary rounded-t-lg">
            <CardTitle className="text-right text-2xl font-bold text-white">إدارة تذاكر الدعم الفني</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and filter section with better organization */}
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-5 w-5 text-company" />
                </div>
                <Input
                  placeholder="بحث عن تذكرة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-right border-company/20 focus:border-company focus:ring-1 focus:ring-company"
                  dir="rtl"
                />
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 left-0 flex items-center pl-3"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <div className="w-full md:w-2/3">
                <Tabs 
                  defaultValue="all" 
                  value={activeFilter}
                  onValueChange={setActiveFilter}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full bg-gray-100">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:bg-company data-[state=active]:text-white"
                    >
                      الكل
                    </TabsTrigger>
                    <TabsTrigger 
                      value="pending"
                      className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                    >
                      قيد الانتظار
                    </TabsTrigger>
                    <TabsTrigger 
                      value="open"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      مفتوحة
                    </TabsTrigger>
                    <TabsTrigger 
                      value="inprogress"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    >
                      جاري المعالجة
                    </TabsTrigger>
                    <TabsTrigger 
                      value="resolved"
                      className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                    >
                      تم الحل
                    </TabsTrigger>
                    <TabsTrigger 
                      value="closed"
                      className="data-[state=active]:bg-slate-500 data-[state=active]:text-white"
                    >
                      مغلقة
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-company border-r-transparent"></div>
                <p className="mt-4 text-lg font-medium text-company">جاري تحميل التذاكر...</p>
              </div>
            ) : (
              <div className="rounded-md border-2 border-gray-200 overflow-hidden shadow-sm">
                <Table>
                  {/* Enhanced header styling */}
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b-2 border-gray-200">
                      <TableHead className="text-right font-bold text-company py-4">رقم التذكرة</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">الرقم الوظيفي</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">الفرع</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">الأهمية</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">الحالة</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right font-bold text-company py-4">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTickets().length > 0 ? (
                      filterTickets().map((ticket) => (
                        <TableRow 
                          key={ticket.id} 
                          className="hover:bg-gray-50 border-b border-gray-200"
                        >
                          <TableCell className="font-medium text-right py-4">{ticket.ticket_id}</TableCell>
                          <TableCell className="text-right py-4">{ticket.employee_id}</TableCell>
                          <TableCell className="text-right py-4">{ticket.branch}</TableCell>
                          <TableCell className="text-right py-4">
                            {getPriorityDisplay(ticket.priority)}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <Badge className={`font-medium px-3 py-1 rounded-md text-sm ${statusColorMap[ticket.status] || 'bg-gray-100'}`}>
                              {statusLabels[ticket.status] || ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            {new Date(ticket.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="py-4">
                            <Button 
                              size="sm" 
                              onClick={() => handleViewTicket(ticket.ticket_id)}
                              className="bg-company hover:bg-company-dark"
                            >
                              عرض التفاصيل
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-32">
                          {searchQuery ? (
                            <p className="text-lg text-gray-500">لا توجد تذاكر تطابق معايير البحث</p>
                          ) : (
                            <p className="text-lg text-gray-500">لا توجد تذاكر {activeFilter !== 'all' ? `بحالة ${statusLabels[activeFilter]}` : ''}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {!loading && filterTickets().length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-sm text-gray-500">
                  عدد التذاكر: {filterTickets().length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
