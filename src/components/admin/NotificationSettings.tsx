
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { saveAdminNotificationEmail } from '@/utils/notificationUtils';

const NotificationSettings = () => {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialEmail, setInitialEmail] = useState('');
  const { adminData } = useAdminAuth();

  useEffect(() => {
    if (adminData?.id) {
      fetchNotificationEmail();
    }
  }, [adminData]);

  const fetchNotificationEmail = async () => {
    if (!adminData?.id) return;

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('notification_email')
        .eq('id', adminData.id)
        .single();

      if (error) throw error;

      if (data?.notification_email) {
        setNotificationEmail(data.notification_email);
        setInitialEmail(data.notification_email);
      }
    } catch (error) {
      console.error('Error fetching notification email:', error);
    }
  };

  const handleSaveEmail = async () => {
    if (!adminData?.id) {
      toast.error('لم يتم العثور على بيانات المسؤول');
      return;
    }

    setLoading(true);
    try {
      const success = await saveAdminNotificationEmail(adminData.id, notificationEmail);

      if (success) {
        toast.success('تم حفظ البريد الإلكتروني للإشعارات بنجاح');
        setInitialEmail(notificationEmail);
      } else {
        toast.error('فشل في حفظ البريد الإلكتروني');
      }
    } catch (error) {
      console.error('Error saving notification email:', error);
      toast.error('حدث خطأ أثناء حفظ البريد الإلكتروني');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = notificationEmail !== initialEmail;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-right">إعدادات الإشعارات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notification-email" className="text-right block">
            البريد الإلكتروني لاستلام إشعارات التذاكر الجديدة
          </Label>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveEmail}
              disabled={loading || !hasChanges}
              className="shrink-0"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
            <Input
              id="notification-email"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني لاستلام الإشعارات"
              className="text-right flex-1"
              dir="rtl"
            />
          </div>
          <p className="text-sm text-muted-foreground text-right">
            سيتم إرسال إشعار إلى هذا البريد الإلكتروني عند إنشاء تذكرة دعم فني جديدة
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
