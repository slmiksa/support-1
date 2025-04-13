
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// استخدم مفتاح API المخزن في متغيرات البيئة
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY environment variable is not set");
}

console.log("Initializing Resend with API key");
const resend = new Resend(resendApiKey);

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
  customer_email?: string;
  status?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send notification");
    
    const { 
      ticket_id, 
      employee_id, 
      branch, 
      description, 
      priority, 
      admin_email, 
      support_email = 'help@alwaslsaudi.com',
      customer_email,
      status = 'pending',
    }: TicketNotificationRequest = await req.json();

    console.log(`Sending notification for ticket ${ticket_id}`);
    console.log(`Customer email: ${customer_email}`);
    console.log(`Admin email: ${admin_email}`);
    console.log(`Support email: ${support_email}`);

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    // Validate required fields
    if (!ticket_id || !employee_id || !branch) {
      throw new Error("Missing required fields");
    }

    // Priority and status mapping for Arabic labels
    const priorityLabels: Record<string, string> = {
      'urgent': 'عاجلة',
      'medium': 'متوسطة',
      'normal': 'عادية'
    };

    const statusLabels: Record<string, string> = {
      'pending': 'قيد الانتظار',
      'open': 'مفتوحة',
      'inprogress': 'قيد المعالجة',
      'resolved': 'تم الحل',
      'closed': 'مغلقة'
    };

    const formattedPriority = priorityLabels[priority as keyof typeof priorityLabels] || 'عادية';
    const formattedStatus = statusLabels[status as keyof typeof statusLabels] || status;

    // Prepare the email HTML template
    const emailHtml = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #D4AF37; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">تذكرة دعم فني جديدة</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; margin-bottom: 25px; color: #555555;">تم إنشاء تذكرة دعم فني جديدة:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">رقم التذكرة:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${ticket_id}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الفرع:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${branch}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الأولوية:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${formattedPriority}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الرقم الوظيفي:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${employee_id}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">وصف المشكلة:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${description}</td>
            </tr>
            ${customer_email ? `
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">البريد الإلكتروني للعميل:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${customer_email}</td>
            </tr>
            ` : ''}
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://support.alwaslsaudi.com/admin/tickets/${ticket_id}" 
               style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              مشاهدة التذكرة
            </a>
          </div>
        </div>
      </div>
    `;

    // Send email to support team
    console.log("Attempting to send support notification email to:", support_email);
    try {
      const supportEmailResponse = await resend.emails.send({
        from: `دعم الوصل <${support_email}>`,
        to: [support_email],
        subject: `تذكرة دعم فني جديدة رقم ${ticket_id}`,
        html: emailHtml,
      });

      console.log("Support notification sent:", JSON.stringify(supportEmailResponse));
    } catch (supportError) {
      console.error("Error sending support notification:", supportError);
    }

    // Send email to admin
    console.log("Attempting to send admin notification email to:", admin_email);
    try {
      const adminEmailResponse = await resend.emails.send({
        from: `دعم الوصل <${support_email}>`,
        to: [admin_email],
        subject: `تذكرة دعم فني جديدة رقم ${ticket_id}`,
        html: emailHtml,
      });

      console.log("Admin notification sent:", JSON.stringify(adminEmailResponse));
    } catch (adminError) {
      console.error("Error sending admin notification:", adminError);
    }

    // If customer email is provided, send confirmation to customer
    let customerEmailResponse = null;
    if (customer_email) {
      console.log("Attempting to send customer notification email to:", customer_email);
      const customerHtml = `
        <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #D4AF37; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">تم استلام طلب الدعم الفني</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; margin-bottom: 25px; color: #555555;">تم استلام طلب الدعم الفني الخاص بك وسيتم التواصل معك قريباً:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">رقم التذكرة:</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${ticket_id}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الحالة:</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${formattedStatus}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الوصف:</td>
                <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${description}</td>
              </tr>
            </table>

            <div style="background-color: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0;">يمكنك متابعة حالة طلبك من خلال الدخول على نظام الدعم الفني وإدخال رقم التذكرة.</p>
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

      try {
        customerEmailResponse = await resend.emails.send({
          from: `دعم الوصل <${support_email}>`,
          to: [customer_email],
          subject: `تم استلام طلب الدعم الفني رقم ${ticket_id}`,
          html: customerHtml,
        });

        console.log("Customer notification sent:", JSON.stringify(customerEmailResponse));
      } catch (customerError) {
        console.error("Error sending customer notification:", customerError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        supportNotification: "Sent",
        adminNotification: "Sent",
        customerNotification: customer_email ? "Sent" : null 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

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
