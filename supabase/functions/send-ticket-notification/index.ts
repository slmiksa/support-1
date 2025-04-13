
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_RqWw6zr2_Amr7mwGUQaxaeiK1dNdTnv2N");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketNotificationRequest {
  ticket_id: string;
  employee_id: string;
  branch: string;
  description: string;
  priority?: string;
  admin_email: string;
  support_email?: string;
  customer_email?: string; // إضافة حقل البريد الإلكتروني للعميل
  status?: string; // إضافة حقل حالة التذكرة
  update_message?: string; // رسالة التحديث الاختيارية
}

const handler = async (req: Request): Promise<Response> => {
  // التعامل مع طلبات CORS المسبقة
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      ticket_id, 
      employee_id, 
      branch, 
      description, 
      priority, 
      admin_email, 
      support_email = 'help@alwaslsaudi.com',
      customer_email, // بريد العميل الاختياري
      status,
      update_message
    }: TicketNotificationRequest = await req.json();

    console.log(`Sending notification for ticket ${ticket_id}`);

    // التحقق من صحة الإدخالات الأساسية
    if (!ticket_id || !employee_id || !branch || !admin_email) {
      throw new Error("Missing required fields");
    }

    // التحقق إذا كان هناك بريد إلكتروني للعميل
    if (!customer_email) {
      console.log("No customer email provided. Skipping customer notification.");
      return new Response(JSON.stringify({ message: "No customer email" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // معالجة الحالات والأولويات
    const statusLabels: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'open': 'مفتوحة',
      'inprogress': 'قيد المعالجة',
      'resolved': 'تم الحل',
      'closed': 'مغلقة'
    };

    const priorityLabels: Record<string, string> = {
      'urgent': 'عاجلة',
      'medium': 'متوسطة',
      'normal': 'عادية'
    };

    const formattedStatus = statusLabels[status as keyof typeof statusLabels] || status;
    const formattedPriority = priorityLabels[priority as keyof typeof priorityLabels] || 'عادية';

    // إنشاء محتوى البريد الإلكتروني
    const emailHtml = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #D4AF37; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">تحديث على طلب الدعم الفني</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; margin-bottom: 25px; color: #555555;">تم تحديث طلب الدعم الخاص بك:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">رقم التذكرة:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${ticket_id}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الحالة الجديدة:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #2e7d32;">${formattedStatus}</td>
            </tr>
            ${update_message ? `
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">ملاحظات التحديث:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${update_message}</td>
            </tr>
            ` : ''}
          </table>

          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0;">يمكنك متابعة تفاصيل طلبك من خلال الدخول على نظام الدعم الفني وإدخال رقم التذكرة.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://support.alwaslsaudi.com/ticket-status/${ticket_id}" 
               style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              تتبع الطلب
            </a>
          </div>
        </div>
      </div>
    `;

    // إرسال البريد الإلكتروني للعميل
    const emailResponse = await resend.emails.send({
      from: `نظام دعم الوصل <onboarding@resend.dev>`,
      to: [customer_email],
      subject: `تحديث طلب الدعم الفني رقم ${ticket_id}`,
      html: emailHtml,
    });

    console.log("Customer notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Customer notification sent" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
