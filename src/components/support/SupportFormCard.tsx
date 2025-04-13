
import { FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData } from './useFormData';
import { SiteField, Branch } from '@/utils/ticketUtils';
import { 
  PrioritySelect, 
  BranchSelect, 
  CustomFieldInput, 
  DescriptionInput, 
  ImageUpload, 
  SubmitButton,
  FormField 
} from './FormComponents';

interface SupportFormCardProps {
  formData: FormData;
  customFields: SiteField[];
  branches: Branch[];
  imagePreview: string | null;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSelectChange: (value: string, fieldName?: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
}

const SupportFormCard = ({
  formData,
  customFields,
  branches,
  imagePreview,
  isSubmitting,
  handleChange,
  handleSelectChange,
  handleImageChange,
  resetImage,
  onSubmit
}: SupportFormCardProps) => {
  // Sort fields based on sort_order
  const sortedCustomFields = [...customFields].sort((a, b) => 
    (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  
  return (
    <Card className="border-company/20 glass">
      <CardHeader>
        <CardTitle className="text-right">طلب دعم فني جديد</CardTitle>
        <CardDescription className="text-right">
          يرجى تعبئة النموذج التالي لتقديم طلب دعم فني
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-4">
            <PrioritySelect 
              value={formData.priority} 
              onChange={(value) => handleSelectChange(value, 'priority')} 
            />
            
            <BranchSelect 
              value={formData.branch} 
              branches={branches} 
              onChange={(value) => handleSelectChange(value, 'branch')} 
            />
            
            {sortedCustomFields.map(field => {
              // Special handling for Anydesk and Employee number fields
              const isNumericField = 
                field.field_name === 'anydesk_number' || 
                field.field_name === 'field_1743981608110'; // Employee number field

              return (
                <CustomFieldInput
                  key={field.id}
                  field={field}
                  value={formData[field.field_name] as string}
                  onChange={handleChange}
                  numbersOnly={isNumericField}
                />
              );
            })}
            
            <DescriptionInput 
              value={formData.description} 
              onChange={handleChange} 
            />
            
            <ImageUpload 
              imagePreview={imagePreview} 
              handleImageChange={handleImageChange} 
              resetImage={resetImage} 
            />
          </div>
          
          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      </CardContent>
    </Card>
  );
};

export default SupportFormCard;
