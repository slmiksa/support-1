
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { saveCompanyEmailSettings, getCompanyEmailSettings } from '@/utils/notificationUtils';

const CompanyEmailSettings = () => {
  const [senderEmail, setSenderEmail] = useState('help@alwaslsaudi.com');
  const [senderName, setSenderName] = useState('دعم الوصل');
  const [loading, setLoading] = useState(false);
  const [initialEmail, setInitialEmail] = useState('');
  const [initialName, setInitialName] = useState('');

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      const settings = await getCompanyEmailSettings();
      setSenderEmail(settings.senderEmail);
      setSenderName(settings.senderName);
      setInitialEmail(settings.senderEmail);
      setInitialName(settings.senderName);
    } catch (error) {
      console.error('Error fetching email settings:', error);
      // Use default values if there's an error
      setSenderEmail('help@alwaslsaudi.com');
      setSenderName('دعم الوصل');
      setInitialEmail('help@alwaslsaudi.com');
      setInitialName('دعم الوصل');
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const success = await saveCompanyEmailSettings(senderEmail, senderName);

      if (success) {
        toast.success('تم حفظ إعدادات البريد الإلكتروني بنجاح', {
          duration: 30000
        });
        setInitialEmail(senderEmail);
        setInitialName(senderName);
      } else {
        toast.error('فشل في حفظ إعدادات البريد الإلكتروني', {
          duration: 30000
        });
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('حدث خطأ أثناء حفظ الإعدادات', {
        duration: 30000
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = senderEmail !== initialEmail || senderName !== initialName;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-right">إعدادات البريد الإلكتروني للشركة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sender-email" className="text-right block">
            عنوان البريد الإلكتروني المرسل (من)
          </Label>
          <div className="flex gap-2">
            <Input
              id="sender-email"
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="أدخل البريد الإلكتروني للمرسل"
              className="text-right flex-1"
              dir="rtl"
            />
          </div>
          <p className="text-sm text-muted-foreground text-right">
            يجب التحقق من هذا النطاق في حساب Resend الخاص بك
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sender-name" className="text-right block">
            اسم المرسل
          </Label>
          <div className="flex gap-2">
            <Input
              id="sender-name"
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="أدخل اسم المرسل"
              className="text-right flex-1"
              dir="rtl"
            />
          </div>
          <p className="text-sm text-muted-foreground text-right">
            سيظهر هذا الاسم كمرسل البريد الإلكتروني
          </p>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSaveSettings}
            disabled={loading || !hasChanges}
            className="w-full md:w-auto"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyEmailSettings;
