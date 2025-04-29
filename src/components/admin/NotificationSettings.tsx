
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Mail, Save, AlertCircle } from 'lucide-react';

const NotificationSettings = () => {
  const [notificationEmail, setNotificationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialEmail, setInitialEmail] = useState('');
  const { currentAdmin, updateAdminNotificationEmail } = useAdminAuth();

  useEffect(() => {
    if (currentAdmin?.notification_email) {
      setNotificationEmail(currentAdmin.notification_email);
      setInitialEmail(currentAdmin.notification_email);
    }
  }, [currentAdmin]);

  const handleSaveEmail = async () => {
    if (!currentAdmin?.id) {
      toast.error('لم يتم العثور على بيانات المسؤول', {
        duration: 30000
      });
      return;
    }

    setLoading(true);
    try {
      const success = await updateAdminNotificationEmail(notificationEmail);

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

  const hasChanges = notificationEmail !== initialEmail;

  return (
    <Card className="overflow-hidden border-border/20 shadow-card">
      <div className="h-2 bg-gradient-to-r from-company to-company-dark"></div>
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-right flex items-center justify-end gap-2">
          <Mail className="h-5 w-5 text-company" />
          إعدادات الإشعارات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Alert className="bg-amber-50 border-amber-200 text-amber-800">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <AlertDescription className="text-right">
              في وضع الاختبار، سيتم إرسال جميع الإشعارات إلى البريد الإلكتروني trndsky@gmail.com
            </AlertDescription>
          </div>
        </Alert>
        
        <div className="space-y-4">
          <Label htmlFor="notification-email" className="text-right block text-base">
            البريد الإلكتروني لاستلام إشعارات التذاكر الجديدة
          </Label>
          <div className="flex gap-3 items-start">
            <Button
              onClick={handleSaveEmail}
              disabled={loading || !hasChanges}
              className="shrink-0 bg-company hover:bg-company-dark gap-1"
            >
              {loading ? 'جاري الحفظ...' : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ
                </>
              )}
            </Button>
            <Input
              id="notification-email"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني لاستلام الإشعارات"
              className="text-right flex-1 border-border/30 focus:border-company"
              dir="rtl"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-600 text-right flex items-end justify-end gap-2">
              <span>سيتم إرسال إشعار إلى هذا البريد الإلكتروني عند إنشاء تذكرة دعم فني جديدة</span>
              <InfoIcon className="h-4 w-4 text-blue-500" />
            </p>
            <div className="flex items-center justify-end gap-2 text-sm text-green-600 font-medium">
              <p className="text-right">
                تم تكوين مفتاح Resend API بنجاح. سيتم إرسال الإشعارات من onboarding@resend.dev
              </p>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
