
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusColorClass, getStatusLabel, getFilteredCustomFields, priorityColorMap, priorityLabels } from '@/utils/ticketStatusUtils';
import { Separator } from '@/components/ui/separator';
import TicketStatusSelector from './TicketStatusSelector';

interface TicketDetailsCardProps {
  ticket: any;
  assignedAdmin: any;
  canChangeTicketStatus: boolean;
  handleStatusChange: (newStatus: string) => void;
  updatingStatus: boolean;
  currentAdmin: any;
}

const TicketDetailsCard = ({ 
  ticket, 
  assignedAdmin, 
  canChangeTicketStatus, 
  handleStatusChange,
  updatingStatus,
  currentAdmin
}: TicketDetailsCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className={`px-3 py-1 text-xs rounded-full ${getStatusColorClass(ticket?.status)}`}>
            {getStatusLabel(ticket?.status)}
          </div>
          <CardTitle className="text-right">تفاصيل التذكرة #{ticket?.ticket_id}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">تاريخ الإنشاء: {new Date(ticket.created_at).toLocaleDateString('en-US')}</span>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <TicketStatusSelector
              ticketId={ticket.ticket_id}
              currentStatus={ticket.status}
              onStatusUpdate={handleStatusChange}
              disabled={updatingStatus}
              canChangeStatus={canChangeTicketStatus}
              currentAdmin={currentAdmin}
            />
          </div>
        </div>

        <div className="space-y-4 border rounded-md p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-right font-medium">الرقم الوظيفي:</p>
              <p className="text-right">{ticket.employee_id}</p>
            </div>
            <div>
              <p className="text-right font-medium">الفرع:</p>
              <p className="text-right">{ticket.branch}</p>
            </div>
            <div>
              <p className="text-right font-medium">الأهمية:</p>
              <p className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${priorityColorMap[ticket.priority] || 'bg-blue-100 text-blue-800'}`}>
                  {priorityLabels[ticket.priority] || 'عادية'}
                </span>
              </p>
            </div>
            {ticket.anydesk_number && (
              <div>
                <p className="text-right font-medium">رقم Anydesk:</p>
                <p className="text-right">{ticket.anydesk_number}</p>
              </div>
            )}
            {ticket.extension_number && (
              <div>
                <p className="text-right font-medium">رقم التحويلة:</p>
                <p className="text-right">{ticket.extension_number}</p>
              </div>
            )}
            
            <div>
              <p className="text-right font-medium">موظف الدعم المسؤول:</p>
              <p className="text-right">
                {ticket.assigned_to ? (
                  <span className="font-medium text-company">{ticket.assigned_to}</span>
                ) : (
                  <span className="text-gray-500">لم يتم التعيين</span>
                )}
              </p>
            </div>
            
            {Object.entries(getFilteredCustomFields(ticket)).map(([key, value]) => (
              <div key={key}>
                <p className="text-right font-medium">{key}:</p>
                <p className="text-right">{String(value)}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-right font-medium">وصف المشكلة:</p>
            <div className="p-3 bg-white rounded border mt-2 text-right">
              {ticket.description}
            </div>
          </div>

          {ticket.image_url && (
            <div>
              <p className="text-right font-medium">الصورة المرفقة:</p>
              <div className="flex justify-center mt-2">
                <img 
                  src={ticket.image_url} 
                  alt="صورة مرفقة" 
                  className="max-w-full max-h-96 object-contain rounded border"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketDetailsCard;
