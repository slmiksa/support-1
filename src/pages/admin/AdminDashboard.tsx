
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
import { Search, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define ticket status color map
const statusColorMap = {
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  open: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  inprogress: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  resolved: 'bg-green-100 text-green-800 hover:bg-green-200',
  closed: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

// Define ticket status labels in Arabic
const statusLabels = {
  pending: 'قيد الانتظار',
  open: 'مفتوحة',
  inprogress: 'جاري المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلقة',
};

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-right text-2xl font-bold text-company">إدارة تذاكر الدعم الفني</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
              <div className="relative w-full md:w-1/3">
                <Input
                  placeholder="بحث عن تذكرة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-right"
                  dir="rtl"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 left-0 flex items-center pl-3"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              <Tabs 
                defaultValue="all" 
                value={activeFilter}
                onValueChange={setActiveFilter}
                className="w-full md:w-2/3"
              >
                <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                  <TabsTrigger value="all">الكل</TabsTrigger>
                  <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
                  <TabsTrigger value="open">مفتوحة</TabsTrigger>
                  <TabsTrigger value="inprogress">جاري المعالجة</TabsTrigger>
                  <TabsTrigger value="resolved">تم الحل</TabsTrigger>
                  <TabsTrigger value="closed">مغلقة</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                <p className="mt-2">جاري تحميل التذاكر...</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم التذكرة</TableHead>
                      <TableHead className="text-right">الرقم الوظيفي</TableHead>
                      <TableHead className="text-right">الفرع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTickets().length > 0 ? (
                      filterTickets().map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium text-right">{ticket.ticket_id}</TableCell>
                          <TableCell className="text-right">{ticket.employee_id}</TableCell>
                          <TableCell className="text-right">{ticket.branch}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={statusColorMap[ticket.status] || 'bg-gray-100'}>
                              {statusLabels[ticket.status] || ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(ticket.created_at).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => handleViewTicket(ticket.ticket_id)}
                            >
                              عرض التفاصيل
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          {searchQuery ? (
                            <p>لا توجد تذاكر تطابق معايير البحث</p>
                          ) : (
                            <p>لا توجد تذاكر {activeFilter !== 'all' ? `بحالة ${statusLabels[activeFilter]}` : ''}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
