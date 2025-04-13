import { ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Branch, SiteField } from '@/utils/ticketUtils';
import { PriorityType } from '@/integrations/supabase/client';

interface ImageUploadProps {
  imagePreview: string | null;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
}

export const ImageUpload = ({ imagePreview, handleImageChange, resetImage }: ImageUploadProps) => {
  return (
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
            onClick={resetImage}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

interface PrioritySelectProps {
  value: PriorityType;
  onChange: (value: string) => void;
}

export const PrioritySelect = ({ value, onChange }: PrioritySelectProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="priority" className="text-right">الأهمية</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر مستوى الأهمية" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="urgent">عاجلة</SelectItem>
          <SelectItem value="medium">متوسطة</SelectItem>
          <SelectItem value="normal">عادية</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

interface BranchSelectProps {
  value: string;
  branches: Branch[];
  onChange: (value: string) => void;
}

export const BranchSelect = ({ value, branches, onChange }: BranchSelectProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="branch" className="text-right">الفرع</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر الفرع" />
        </SelectTrigger>
        <SelectContent>
          {branches.length > 0 ? (
            branches.map(branch => (
              <SelectItem key={branch.id} value={branch.name}>
                {branch.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-branches" disabled>لا توجد فروع متاحة</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

interface DescriptionInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

export const DescriptionInput = ({ value, onChange, placeholder = "اكتب وصف المشكلة هنا..." }: DescriptionInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="description" className="text-right">وصف المشكلة</Label>
      <Textarea
        id="description"
        name="description"
        required
        placeholder={placeholder}
        className="min-h-[120px] text-right"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

interface CustomFieldInputProps {
  field: SiteField;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  numbersOnly?: boolean;
  placeholder?: string;
}

export const CustomFieldInput = ({ 
  field, 
  value, 
  onChange, 
  numbersOnly = false,
  placeholder
}: CustomFieldInputProps) => {
  const fieldPlaceholder = field.placeholder || placeholder || `أدخل ${field.display_name}`;
  
  return (
    <div className="grid gap-2">
      <Label htmlFor={field.field_name} className="text-right">
        {field.display_name} {field.is_required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={field.field_name}
        name={field.field_name}
        type="text"
        required={field.is_required}
        placeholder={fieldPlaceholder}
        className="text-right"
        value={value || ''}
        onChange={onChange}
        numbersOnly={numbersOnly}
      />
    </div>
  );
};

interface SubmitButtonProps {
  isSubmitting: boolean;
}

export const SubmitButton = ({ isSubmitting }: SubmitButtonProps) => {
  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? (
        <div className="flex items-center">
          <div className="loader mr-2"></div>
          <span>جاري الإرسال...</span>
        </div>
      ) : 'إرسال الطلب'}
    </Button>
  );
};

interface FormFieldProps {
  field: SiteField;
  data: Record<string, any>;
  onChange: (name: string, value: any) => void;
  branches?: Branch[];
}

export const FormField = ({ 
  field, 
  data, 
  onChange,
  branches = []
}: FormFieldProps) => {
  const isRequired = field.is_required;
  
  if (field.field_name === 'description') {
    return (
      <div className="py-2">
        <Label htmlFor="description" className="text-right block font-bold mb-2">
          {field.display_name} {isRequired && <span className="text-destructive">*</span>}
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder={field.placeholder || "يرجى وصف المشكلة بالتفصيل..."}
          value={data.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          className="min-h-[100px] text-right"
          required={isRequired}
        />
      </div>
    );
  }
  
  if (field.field_name === 'branch') {
    return (
      <div className="grid gap-2">
        <Label htmlFor="branch" className="text-right">الفرع</Label>
        <Select
          value={data.branch || ''}
          onValueChange={(val) => onChange('branch', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر الفرع" />
          </SelectTrigger>
          <SelectContent>
            {branches.length > 0 ? (
              branches.map(branch => (
                <SelectItem key={branch.id} value={branch.name}>
                  {branch.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-branches" disabled>لا توجد فروع متاحة</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  if (field.field_name === 'employee_id') {
    return (
      <div className="py-2">
        <Label htmlFor="employee_id" className="text-right block font-bold mb-2">
          {field.display_name} {isRequired && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id="employee_id"
          name="employee_id"
          placeholder={field.placeholder || "أدخل الرقم الوظيفي..."}
          value={data.employee_id || ''}
          onChange={(e) => onChange('employee_id', e.target.value)}
          className="text-right"
          required={isRequired}
        />
      </div>
    );
  }
  
  if (field.field_name === 'anydesk_number') {
    return (
      <div className="py-2">
        <Label htmlFor="anydesk_number" className="text-right block font-bold mb-2">
          {field.display_name} {isRequired && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id="anydesk_number"
          name="anydesk_number"
          placeholder={field.placeholder || "أدخل رقم AnyDesk..."}
          value={data.anydesk_number || ''}
          onChange={(e) => onChange('anydesk_number', e.target.value)}
          className="text-right"
          required={isRequired}
          numbersOnly
        />
      </div>
    );
  }
  
  if (field.field_name === 'extension_number') {
    return (
      <div className="py-2">
        <Label htmlFor="extension_number" className="text-right block font-bold mb-2">
          {field.display_name} {isRequired && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id="extension_number"
          name="extension_number"
          placeholder={field.placeholder || "أدخل رقم التحويلة..."}
          value={data.extension_number || ''}
          onChange={(e) => onChange('extension_number', e.target.value)}
          className="text-right"
          required={isRequired}
          numbersOnly
        />
      </div>
    );
  }
  
  return (
    <div className="py-2">
      <Label htmlFor={field.field_name} className="text-right block font-bold mb-2">
        {field.display_name} {isRequired && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={field.field_name}
        name={field.field_name}
        placeholder={field.placeholder || `أدخل ${field.display_name}...`}
        value={data[field.field_name] || ''}
        onChange={(e) => onChange(field.field_name, e.target.value)}
        className="text-right"
        required={isRequired}
      />
    </div>
  );
};
