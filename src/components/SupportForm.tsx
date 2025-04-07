
import { FormEvent } from 'react';
import { toast } from 'sonner';
import { SupportTicket, generateTicketId, saveTicket } from '../utils/ticketUtils';
import { sendTicketNotificationsToAllAdmins } from '@/utils/notificationUtils';
import LoadingForm from './support/LoadingForm';
import SuccessCard from './support/SuccessCard';
import SupportFormCard from './support/SupportFormCard';
import { useFormData } from './support/useFormData';
import { SYSTEM_FIELDS } from './support/constants';

const SupportForm = () => {
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    ticketId,
    setTicketId,
    imagePreview,
    branches,
    customFields,
    loadingBranches,
    loadingFields,
    handleChange,
    handleSelectChange,
    handleImageChange,
    resetImage,
    resetForm
  } = useFormData();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.branch || !formData.description || !formData.priority) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة', {
        closeButton: true,
        position: 'top-center',
        duration: 5000
      });
      return;
    }
    
    for (const field of customFields) {
      if (field.is_required && !formData[field.field_name]) {
        toast.error(`الحقل "${field.display_name}" مطلوب`, {
          closeButton: true,
          position: 'top-center',
          duration: 5000
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const newTicketId = generateTicketId();
      
      const customFieldsData: Record<string, any> = {};
      
      customFields.forEach(field => {
        if (formData[field.field_name]) {
          customFieldsData[field.field_name] = formData[field.field_name];
        }
      });
      
      const newTicket: SupportTicket = {
        ticket_id: newTicketId,
        branch: formData.branch,
        priority: formData.priority,
        description: formData.description,
        // Type assertion to handle the File | string type
        image_url: imagePreview instanceof File ? null : imagePreview,
        status: 'pending',
        created_at: new Date().toISOString(),
        employee_id: formData['field_1743981608110'] || '',
        custom_fields: customFieldsData,
        anydesk_number: formData.anydesk_number as string
      };
      
      const result = await saveTicket(newTicket);
      
      if (!result.success) {
        throw new Error('Failed to save ticket');
      }
      
      try {
        await sendTicketNotificationsToAllAdmins(newTicket);
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
      
      setTicketId(newTicketId);
      resetForm();
      
      toast.success('تم إرسال طلب الدعم بنجاح', {
        closeButton: true,
        position: 'top-center',
        duration: 5000
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى', {
        closeButton: true,
        position: 'top-center',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingBranches || loadingFields) {
    return <LoadingForm />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {ticketId ? (
        <SuccessCard 
          ticketId={ticketId} 
          onNewTicket={() => setTicketId(null)} 
        />
      ) : (
        <SupportFormCard
          formData={formData}
          customFields={customFields}
          branches={branches}
          imagePreview={imagePreview}
          isSubmitting={isSubmitting}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleImageChange={handleImageChange}
          resetImage={resetImage}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default SupportForm;
