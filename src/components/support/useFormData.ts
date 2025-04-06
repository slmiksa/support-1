
import { useState, useEffect, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { getAllBranches, getAllSiteFields, SiteField, Branch } from '@/utils/ticketUtils';
import { PriorityType } from '@/integrations/supabase/client';
import { SYSTEM_FIELDS } from './constants';

export interface FormData {
  employeeId: string;
  branch: string;
  priority: PriorityType;
  description: string;
  imageFile: File | null;
  [key: string]: string | File | null | PriorityType;
}

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    branch: '',
    priority: 'normal',
    description: '',
    imageFile: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customFields, setCustomFields] = useState<SiteField[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingFields, setLoadingFields] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesData = await getAllBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('حدث خطأ أثناء تحميل الفروع');
      } finally {
        setLoadingBranches(false);
      }
    };

    const fetchCustomFields = async () => {
      try {
        const fieldsData = await getAllSiteFields();
        
        // Process fields to prevent duplicates
        const fieldMap = new Map<string, SiteField>();
        
        // First collect all active custom fields (non-system fields)
        fieldsData
          .filter(field => field.is_active && !SYSTEM_FIELDS.includes(field.field_name))
          .forEach(field => {
            // Only add if this field is not already in the map or has a higher ID (more recent)
            if (!fieldMap.has(field.field_name) || field.id > fieldMap.get(field.field_name)!.id) {
              fieldMap.set(field.field_name, field);
            }
          });
        
        // Sort fields by sort_order
        const activeCustomFields = Array.from(fieldMap.values())
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        
        setCustomFields(activeCustomFields);
        
        // Initialize form data with all fields
        const initialFormData: FormData = {
          employeeId: '',
          branch: '',
          priority: 'normal',
          description: '',
          imageFile: null
        };
        
        // Add custom fields to the form data
        activeCustomFields.forEach(field => {
          initialFormData[field.field_name] = '';
        });
        
        setFormData(initialFormData);
      } catch (error) {
        console.error('Error fetching custom fields:', error);
        toast.error('حدث خطأ أثناء تحميل الحقول المخصصة');
      } finally {
        setLoadingFields(false);
      }
    };

    fetchBranches();
    fetchCustomFields();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, fieldName: string = 'branch') => {
    if (fieldName === 'priority') {
      const validPriorities: PriorityType[] = ['urgent', 'medium', 'normal'];
      const priorityValue = validPriorities.includes(value as PriorityType) 
        ? value as PriorityType 
        : 'normal';
      setFormData(prev => ({ ...prev, [fieldName]: priorityValue }));
    } else {
      setFormData(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imageFile: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageFile: null }));
  };

  const resetForm = () => {
    const resetFormData: FormData = {
      employeeId: '',
      branch: '',
      priority: 'normal',
      description: '',
      imageFile: null
    };
    
    customFields.forEach(field => {
      resetFormData[field.field_name] = '';
    });
    
    setFormData(resetFormData);
    setImagePreview(null);
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    ticketId,
    setTicketId,
    imagePreview,
    setImagePreview,
    branches,
    customFields,
    loadingBranches,
    loadingFields,
    handleChange,
    handleSelectChange,
    handleImageChange,
    resetImage,
    resetForm
  };
};
