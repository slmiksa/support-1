
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
  const [testLoading, setTestLoading] = useState(false);
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
      toast.error('لم يتم العثور على بيانات المسؤول', {
        duration: 30000
      });
      return;
    }

    setLoading(true);
    try {
      const success = await saveAdminNotificationEmail(adminData.id, notificationEmail);

      if (success) {
        toast.success('تم حفظ البريد الإلكتروني للإشعارات بنجاح', {
          duration: 30000
        });
        setInitialEmail(notificationEmail);
      } else {
        toast.error('فشل في حفظ البريد الإلكتروني', {
          duration: 30000
        });
      }
    } catch (error) {
      console.error('Error saving notification email:', error);
      toast.error('حدث خطأ أثناء حفظ البريد الإلكتروني', {
        duration: 30000
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    const emailToTest = notificationEmail || initialEmail;
    
    if (!emailToTest) {
      toast.error('الرجاء إدخال بريد إلكتروني أولاً', {
        duration: 30000
      });
      return;
    }

    setTestLoading(true);
    try {
      // Create a mock ticket for testing
      const mockTicket = {
        ticket_id: 'TEST-' + Date.now().toString().slice(-6),
        employee_id: 'TEST-EMPLOYEE',
        branch: 'الفرع الرئيسي (اختبار)',
        description: 'هذه رسالة اختبار للتأكد من عمل نظام الإشعارات بشكل صحيح. تم إرسالها في ' + new Date().toLocaleString('ar-SA'),
        status: 'new'
      };

      // Call the function
      const { data, error } = await supabase.functions.invoke(
        'send-ticket-notification',
        {
          body: {
            ticket_id: mockTicket.ticket_id,
            employee_id: mockTicket.employee_id,
            branch: mockTicket.branch,
            description: mockTicket.description,
            admin_email: emailToTest
          }
        }
      );

      if (error) {
        throw error;
      }

      toast.success(`تم إرسال إشعار اختباري إلى ${emailToTest} بنجاح`, {
        duration: 30000
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('فشل في إرسال الإشعار الاختباري', {
        duration: 30000
      });
    } finally {
      setTestLoading(false);
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

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Button 
              onClick={sendTestNotification} 
              variant="outline" 
              disabled={testLoading}
              className="w-full"
            >
              {testLoading ? 'جاري إرسال الاختبار...' : 'إرسال إشعار اختباري الآن'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-right mt-2">
            اختبر إعدادات الإشعارات بإرسال رسالة تجريبية إلى البريد الإلكتروني المحدد أعلاه
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
