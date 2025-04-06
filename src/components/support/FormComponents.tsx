
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

interface EmployeeIdInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const EmployeeIdInput = ({ value, onChange }: EmployeeIdInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="employeeId" className="text-right">الرقم الوظيفي</Label>
      <Input
        id="employeeId"
        name="employeeId"
        type="text"
        required
        placeholder="أدخل الرقم الوظيفي"
        className="text-right"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

interface DescriptionInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

export const DescriptionInput = ({ value, onChange }: DescriptionInputProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor="description" className="text-right">محتوى الشكوى</Label>
      <Textarea
        id="description"
        name="description"
        required
        placeholder="اكتب محتوى الشكوى هنا..."
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
}

export const CustomFieldInput = ({ field, value, onChange }: CustomFieldInputProps) => {
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
        placeholder={`أدخل ${field.display_name}`}
        className="text-right"
        value={value || ''}
        onChange={onChange}
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
