
import { useState, useEffect } from 'react';
import { getAllSiteFields, updateSiteField, SiteField } from '@/utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const SiteFieldsManager = () => {
  const [fields, setFields] = useState<SiteField[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAdminAuth();
  const canManageAdmins = hasPermission('manage_admins');

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    const data = await getAllSiteFields();
    setFields(data);
    setLoading(false);
  };

  const handleToggleRequired = async (field: SiteField) => {
    if (!canManageAdmins) return;
    
    const newValue = !field.is_required;
    const success = await updateSiteField(field.id, { is_required: newValue });
    
    if (success) {
      setFields(fields.map(f => f.id === field.id ? { ...f, is_required: newValue } : f));
      toast.success(`تم تحديث حالة الحقل ${field.display_name}`);
    } else {
      toast.error('فشل في تحديث الحقل');
    }
  };

  const handleToggleActive = async (field: SiteField) => {
    if (!canManageAdmins) return;
    
    const newValue = !field.is_active;
    const success = await updateSiteField(field.id, { is_active: newValue });
    
    if (success) {
      setFields(fields.map(f => f.id === field.id ? { ...f, is_active: newValue } : f));
      toast.success(`تم تحديث حالة الحقل ${field.display_name}`);
    } else {
      toast.error('فشل في تحديث الحقل');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-right text-xl font-bold text-company">إدارة حقول الموقع</CardTitle>
      </CardHeader>
      <CardContent>
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
                  <TableHead className="text-right">اسم الحقل</TableHead>
                  <TableHead className="text-right">مطلوب</TableHead>
                  <TableHead className="text-right">نشط</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length > 0 ? (
                  fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium text-right">{field.display_name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={field.is_required}
                          onCheckedChange={() => handleToggleRequired(field)}
                          disabled={!canManageAdmins}
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={field.is_active}
                          onCheckedChange={() => handleToggleActive(field)}
                          disabled={!canManageAdmins}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      <p>لا توجد حقول مسجلة</p>
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

export default SiteFieldsManager;
