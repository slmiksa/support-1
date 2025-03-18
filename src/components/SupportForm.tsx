
import { useState, FormEvent, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { SupportTicket, generateTicketId, saveTicket } from '../utils/ticketUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FormData {
  employeeId: string;
  branch: string;
  anydeskNumber: string;
  extensionNumber: string;
  description: string;
  imageFile: File | null;
}

const SupportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    branch: '',
    anydeskNumber: '',
    extensionNumber: '',
    description: '',
    imageFile: null
  });
  
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, branch: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.employeeId || !formData.branch || !formData.description) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate new ticket ID
      const newTicketId = generateTicketId();
      
      // Create ticket object
      const newTicket: SupportTicket = {
        ticket_id: newTicketId,
        employee_id: formData.employeeId,
        branch: formData.branch,
        anydesk_number: formData.anydeskNumber,
        extension_number: formData.extensionNumber,
        description: formData.description,
        image_url: imagePreview || undefined,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Save ticket to storage
      const result = await saveTicket(newTicket);
      
      if (!result.success) {
        throw new Error('Failed to save ticket');
      }
      
      // Display success message
      setTicketId(newTicketId);
      
      // Reset form after submission
      setFormData({
        employeeId: '',
        branch: '',
        anydeskNumber: '',
        extensionNumber: '',
        description: '',
        imageFile: null
      });
      setImagePreview(null);
      
      toast.success('تم إرسال طلب الدعم بنجاح');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {ticketId ? (
        <Card className="border-company/20 glass">
          <CardHeader>
            <CardTitle className="text-center">تم إرسال طلب الدعم بنجاح</CardTitle>
            <CardDescription className="text-center">يرجى الاحتفاظ برقم الطلب لمتابعة حالة الطلب</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">رقم الطلب الخاص بك:</p>
              <p className="text-2xl font-bold text-company bg-company-light py-2 px-4 rounded-md">{ticketId}</p>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              يمكنك متابعة حالة طلبك من خلال صفحة "متابعة طلب الدعم"
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setTicketId(null)} className="mt-2">
              إرسال طلب جديد
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-company/20 glass">
          <CardHeader>
            <CardTitle className="text-right">طلب دعم فني جديد</CardTitle>
            <CardDescription className="text-right">
              يرجى تعبئة النموذج التالي لتقديم طلب دعم فني
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="employeeId" className="text-right">الرقم الوظيفي</Label>
                  <Input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    placeholder="أدخل الرقم الوظيفي"
                    className="text-right"
                    value={formData.employeeId}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="branch" className="text-right">الفرع</Label>
                  <Select
                    value={formData.branch}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="شركة مدى">شركة مدى</SelectItem>
                      <SelectItem value="الوصل جدة">الوصل جدة</SelectItem>
                      <SelectItem value="الوصل الرياض">الوصل الرياض</SelectItem>
                      <SelectItem value="الوصل الشرقية">الوصل الشرقية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="anydeskNumber" className="text-right">رقم anydesk</Label>
                  <Input
                    id="anydeskNumber"
                    name="anydeskNumber"
                    type="text"
                    placeholder="أدخل رقم anydesk"
                    className="text-right"
                    value={formData.anydeskNumber}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="extensionNumber" className="text-right">رقم التحويلة</Label>
                  <Input
                    id="extensionNumber"
                    name="extensionNumber"
                    type="text"
                    placeholder="أدخل رقم التحويلة"
                    className="text-right"
                    value={formData.extensionNumber}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-right">محتوى الشكوى</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="اكتب محتوى الشكوى هنا..."
                    className="min-h-[120px] text-right"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="imageFile" className="text-right">إرفاق صورة (اختياري)</Label>
                  <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    className="text-right cursor-pointer"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview}
                        alt="صورة مرفقة"
                        className="w-full max-h-48 object-contain rounded-md border border-border"
                      />
                      <button
                        type="button"
                        className="absolute top-2 left-2 bg-white/80 rounded-full p-1 hover:bg-white"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, imageFile: null }));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                          <path d="M18 6 6 18"></path>
                          <path d="m6 6 12 12"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="loader mr-2"></div>
                    <span>جاري الإرسال...</span>
                  </div>
                ) : 'إرسال الطلب'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupportForm;
