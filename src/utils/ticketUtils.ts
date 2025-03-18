
// Generate a unique ticket ID with wsl- prefix
export const generateTicketId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `wsl-${timestamp}${randomStr}`.substring(0, 12);
};

// Simulate ticket storage 
// (in a real app, this would connect to a backend)
const STORAGE_KEY = 'wsl_support_tickets';

export interface SupportTicket {
  id: string;
  employeeId: string;
  branch: string;
  anydeskNumber: string;
  extensionNumber: string;
  description: string;
  imageFile?: File | null;
  imageUrl?: string;
  status: 'pending' | 'resolved';
  createdAt: number;
  response?: string;
}

export const saveTicket = (ticket: SupportTicket): void => {
  const existingTickets = getStoredTickets();
  const updatedTickets = [...existingTickets, ticket];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTickets));
};

export const getStoredTickets = (): SupportTicket[] => {
  const storedTickets = localStorage.getItem(STORAGE_KEY);
  return storedTickets ? JSON.parse(storedTickets) : [];
};

export const findTicketById = (ticketId: string): SupportTicket | undefined => {
  const tickets = getStoredTickets();
  return tickets.find(ticket => ticket.id === ticketId);
};

export const updateTicket = (ticketId: string, updates: Partial<SupportTicket>): boolean => {
  const tickets = getStoredTickets();
  const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);
  
  if (ticketIndex === -1) return false;
  
  tickets[ticketIndex] = { ...tickets[ticketIndex], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  return true;
};

// Simulating a response for demo purposes
export const simulateTicketResponse = (ticketId: string): boolean => {
  const responses = [
    "تم استلام طلبك وسنقوم بالتواصل معك قريباً",
    "نعمل حالياً على حل المشكلة، يرجى المحاولة مرة أخرى بعد ساعة",
    "تم حل المشكلة، يرجى إعادة تشغيل الجهاز والتأكد من عمل التطبيق",
    "سيقوم الفني بالتواصل معك خلال 30 دقيقة",
    "تم إرسال الحل على بريدك الإلكتروني، يرجى التحقق"
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return updateTicket(ticketId, { 
    response: randomResponse,
    status: 'resolved'
  });
};
