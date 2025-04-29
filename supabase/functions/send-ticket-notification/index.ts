
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// استخدم مفتاح API المخزن في متغيرات البيئة
const resendApiKey = Deno.env.get("RESEND_API_KEY");

console.log("Initializing Resend with API key:", resendApiKey ? "API key found" : "API key missing");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketNotificationRequest {
  ticket_id: string;
  employee_id?: string;
  branch: string;
  description: string;
  priority?: string;
  admin_email: string;
  support_email?: string;
  customer_email?: string;
  status?: string;
  company_sender_email?: string | null;
  company_sender_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send notification at:", new Date().toISOString());
    console.log("Request received:", req.method);
    
    // Log request body for debugging
    const requestBody = await req.text();
    console.log("Request body:", requestBody);
    
    // Re-parse the body since we already consumed the stream
    const { 
      ticket_id, 
      employee_id = "", 
      branch, 
      description, 
      priority = "normal", 
      admin_email, 
      support_email = 'help@alwaslsaudi.com',
      customer_email,
      status = 'pending',
      company_sender_email = null,
      company_sender_name = 'دعم الوصل'
    }: TicketNotificationRequest = JSON.parse(requestBody);

    // During testing, only use trndsky@gmail.com
    const testingEmail = 'trndsky@gmail.com';

    console.log("Parsed data:");
    console.log(`Sending notification for ticket ${ticket_id}`);
    console.log(`Employee ID: ${employee_id || 'not provided'}`);
    console.log(`Branch: ${branch}`);
    console.log(`Description length: ${description?.length || 0}`);
    console.log(`Original admin email: ${admin_email}`);
    console.log(`Using testing email: ${testingEmail}`);
    console.log(`Support email: ${support_email}`);
    console.log(`Priority: ${priority}`);
    console.log(`Company sender name: ${company_sender_name}`);

    // Verify resendApiKey is available
    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    // Validate required fields with more detailed logging
    const missingFields = [];
    if (!ticket_id) missingFields.push("ticket_id");
    if (!branch) missingFields.push("branch");
    if (!description) missingFields.push("description");
    
    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(", ")}`);
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
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
            ${employee_id ? `
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الرقم الوظيفي:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${employee_id}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">وصف المشكلة:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${description}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://support.alwaslsaudi.com/admin/tickets/${ticket_id}" 
               style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              مشاهدة التذكرة
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">هذه رسالة تلقائية من نظام الدعم الفني - تم إرسالها إلى ${testingEmail} (وضع الاختبار)</p>
        </div>
      </div>
    `;

    let allEmails = [];
    
    // Send email to testing email
    console.log(`[${new Date().toISOString()}] Attempting to send notification to testing email:`, testingEmail);
    try {
      const emailConfig = { from: `${company_sender_name} <onboarding@resend.dev>` };

      // Try to send email and log detailed response
      console.log("Sending email with config:", JSON.stringify(emailConfig));
      
      const emailResponse = await resend.emails.send({
        ...emailConfig,
        to: [testingEmail],
        subject: `تذكرة دعم فني جديدة رقم ${ticket_id}`,
        html: emailHtml,
      });

      console.log(`[${new Date().toISOString()}] Notification sent to testing email:`, JSON.stringify(emailResponse));
      allEmails.push({ type: 'testing', success: true, response: emailResponse });
    } catch (emailError) {
      console.error(`[${new Date().toISOString()}] Error sending notification to testing email:`, emailError);
      console.error("Error details:", emailError instanceof Error ? emailError.message : String(emailError));
      console.error("Stack trace:", emailError instanceof Error ? emailError.stack : "No stack trace");
      allEmails.push({ type: 'testing', success: false, error: String(emailError) });
      
      // Try sending with detailed error information
      try {
        const errorDetails = emailError instanceof Error ? 
          `Error: ${emailError.message}\n${emailError.stack || ''}` : 
          `Error: ${String(emailError)}`;
            
        const errorEmailResponse = await resend.emails.send({
          from: `Debug <onboarding@resend.dev>`,
          to: [testingEmail],
          subject: `[DEBUG] Error sending ticket notification for ${ticket_id}`,
          text: `There was an error sending the notification email:\n\n${errorDetails}\n\nRequest data:\n${requestBody}`
        });
        
        console.log(`[${new Date().toISOString()}] Debug error email sent:`, JSON.stringify(errorEmailResponse));
      } catch (debugError) {
        console.error(`[${new Date().toISOString()}] Failed to send debug error email:`, debugError);
      }
    }

    // Check if any emails were sent successfully
    const anySent = allEmails.some(email => email.success);
    
    if (!anySent) {
      throw new Error("Failed to send notifications");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        allEmails,
        testingEmail
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
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : "No stack trace available" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
