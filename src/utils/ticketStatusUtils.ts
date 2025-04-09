
// Shared utilities for ticket statuses across admin and user views

export const statusOptions = [
  { value: 'open', label: 'مفتوحة' },
  { value: 'inprogress', label: 'جاري المعالجة' },
  { value: 'resolved', label: 'تم الحل' },
  { value: 'closed', label: 'مغلقة' }
];

export const priorityLabels = {
  'urgent': 'عاجلة',
  'medium': 'متوسطة',
  'normal': 'عادية'
};

export const priorityColorMap = {
  'urgent': 'bg-red-100 text-red-800',
  'medium': 'bg-orange-100 text-orange-800',
  'normal': 'bg-blue-100 text-blue-800'
};

export const getStatusLabel = (status: string): string => {
  const option = statusOptions.find(opt => opt.value === status);
  return option ? option.label : status;
};

export const getStatusColorClass = (status: string): string => {
  const statusColorMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    open: 'bg-blue-100 text-blue-800',
    inprogress: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  
  return statusColorMap[status as keyof typeof statusColorMap] || 'bg-gray-100 text-gray-800';
};

export const getFilteredCustomFields = (ticket: any) => {
  if (!ticket || !ticket.custom_fields) return {};
  
  const customFields = { ...ticket.custom_fields };
  
  if (customFields.support_email) {
    delete customFields.support_email;
  }
  
  return customFields;
};
