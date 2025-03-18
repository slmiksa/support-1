
import { useState, useEffect } from 'react';
import { getAllAdmins, createAdmin, deleteAdmin, Admin } from '@/utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trash2, Plus, UserPlus } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const roleLabels = {
  'super_admin': 'مدير عام',
  'admin': 'مدير',
  'viewer': 'مشاهد فقط'
};

const roleBadgeColors = {
  'super_admin': 'bg-red-100 text-red-800 hover:bg-red-200',
  'admin': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'viewer': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

const formSchema = z.object({
  username: z.string().min(3, { message: 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل' }),
  password: z.string().min(6, { message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' }),
  employee_id: z.string().optional(),
  role: z.enum(['super_admin', 'admin', 'viewer']),
});

type FormValues = z.infer<typeof formSchema>;

const AdminManager = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasPermission, currentAdmin } = useAdminAuth();
  const canManageAdmins = hasPermission('manage_admins');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      employee_id: '',
      role: 'viewer',
    },
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const data = await getAllAdmins();
    setAdmins(data);
    setLoading(false);
  };

  const handleCreateAdmin = async (values: FormValues) => {
    const result = await createAdmin({
      username: values.username,
      password: values.password,
      employee_id: values.employee_id || undefined,
      role: values.role,
    });

    if (result.success) {
      toast.success('تم إنشاء المدير بنجاح');
      form.reset();
      setDialogOpen(false);
      fetchAdmins();
    } else {
      toast.error('فشل في إنشاء المدير');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المدير؟')) {
      // Check if it's the current logged in admin
      if (adminId === currentAdmin?.id) {
        toast.error('لا يمكنك حذف حسابك الحالي');
        return;
      }
      
      const success = await deleteAdmin(adminId);
      if (success) {
        toast.success('تم حذف المدير بنجاح');
        fetchAdmins();
      } else {
        toast.error('فشل في حذف المدير');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-right text-xl font-bold text-company">إدارة المديرين</CardTitle>
      </CardHeader>
      <CardContent>
        {canManageAdmins && (
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus size={16} />
                  <span>إضافة مدير جديد</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة مدير جديد</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateAdmin)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">اسم المستخدم</FormLabel>
                          <FormControl>
                            <Input dir="rtl" placeholder="اسم المستخدم" {...field} />
                          </FormControl>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">كلمة المرور</FormLabel>
                          <FormControl>
                            <Input dir="rtl" type="password" placeholder="كلمة المرور" {...field} />
                          </FormControl>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">الرقم الوظيفي (اختياري)</FormLabel>
                          <FormControl>
                            <Input dir="rtl" placeholder="الرقم الوظيفي" {...field} />
                          </FormControl>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-right block">الصلاحية</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الصلاحية" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="super_admin">مدير عام (كل الصلاحيات)</SelectItem>
                              <SelectItem value="admin">مدير (تعديل حالة التذاكر)</SelectItem>
                              <SelectItem value="viewer">مشاهد فقط</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-right" />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">إضافة</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم المستخدم</TableHead>
                  <TableHead className="text-right">الرقم الوظيفي</TableHead>
                  <TableHead className="text-right">الصلاحية</TableHead>
                  {canManageAdmins && <TableHead className="text-right w-20">إجراءات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length > 0 ? (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium text-right">{admin.username}</TableCell>
                      <TableCell className="text-right">{admin.employee_id || '--'}</TableCell>
                      <TableCell className="text-right">
                        <Badge className={roleBadgeColors[admin.role as keyof typeof roleBadgeColors] || 'bg-gray-100'}>
                          {roleLabels[admin.role as keyof typeof roleLabels] || admin.role}
                        </Badge>
                      </TableCell>
                      {canManageAdmins && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAdmin(admin.id)}
                            disabled={admin.id === currentAdmin?.id}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={canManageAdmins ? 4 : 3} className="text-center h-24">
                      <p>لا يوجد مديرين مسجلين</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminManager;
