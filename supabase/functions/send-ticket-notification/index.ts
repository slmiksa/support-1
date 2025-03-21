
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Update the Resend API key
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
  support_email?: string; // Add optional support_email field
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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
      support_email = 'help@alwaslsaudi.com' // Default value if not provided
    }: TicketNotificationRequest = await req.json();

    console.log(`Sending notification for ticket ${ticket_id} to ${admin_email}`);
    console.log(`Ticket priority: ${priority || 'normal'}`);
    console.log(`Using support email: ${support_email}`);

    // Validate inputs
    if (!ticket_id || !employee_id || !branch || !description || !admin_email) {
      throw new Error("Missing required fields");
    }

    // Create a truncated description for the email
    const truncatedDescription = description.length > 100 
      ? `${description.substring(0, 100)}...` 
      : description;

    // Get priority label in Arabic
    const priorityLabels = {
      urgent: 'عاجلة',
      medium: 'متوسطة',
      normal: 'عادية'
    };
    const priorityLabel = priorityLabels[priority as keyof typeof priorityLabels] || 'عادية';

    // Format the current date and time in Arabic format
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    
    const formattedDate = new Intl.DateTimeFormat('ar-SA', dateOptions).format(now);
    const formattedTime = new Intl.DateTimeFormat('ar-SA', timeOptions).format(now);

    // Priority color mapping
    const priorityColors = {
      urgent: '#c62828',
      medium: '#ff8f00',
      normal: '#2e7d32'
    };
    const priorityColor = priorityColors[priority as keyof typeof priorityColors] || '#2e7d32';

    // Create email HTML content with enhanced professional design
    const emailHtml = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <div style="background-color: #15437f; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">تذكرة دعم فني جديدة</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; margin-bottom: 25px; color: #555555;">تم إنشاء تذكرة دعم فني جديدة في نظام دعم الوصل. فيما يلي تفاصيل التذكرة:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">رقم التذكرة:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${ticket_id}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الرقم الوظيفي:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${employee_id}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الفرع:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${branch}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">الأهمية:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">
                <span style="background-color: ${priority === 'urgent' ? '#ffebee' : priority === 'medium' ? '#fff8e1' : '#e8f5e9'}; padding: 5px 10px; border-radius: 4px; color: ${priorityColor}; font-weight: bold;">${priorityLabel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">تاريخ الإنشاء:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: bold;">وقت الإنشاء:</td>
              <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${formattedTime}</td>
            </tr>
          </table>
          
          <div style="background-color: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-right: 5px solid #15437f;">
            <h3 style="margin-top: 0; color: #15437f; margin-bottom: 15px;">وصف المشكلة:</h3>
            <p style="margin: 0; line-height: 1.6;">${description}</p>
          </div>
          
          <div style="background-color: #fffde7; padding: 15px; border-radius: 8px; border-right: 4px solid #fbc02d;">
            <p style="margin: 0; font-size: 15px; color: #5d4037;">
              <strong>تذكير:</strong> يرجى الاطلاع على هذه التذكرة والرد عليها في أقرب وقت ممكن لضمان تقديم الدعم المناسب.
            </p>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 12px; text-align: center;">
          <p style="margin: 0 0 10px 0;">تم إرسال هذا البريد الإلكتروني تلقائياً من نظام دعم الوصل. يرجى عدم الرد على هذا البريد.</p>
          <p style="margin: 0; color: #999;">© ${now.getFullYear()} نظام دعم الوصل. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    `;

    try {
      console.log("Attempting to send email with Resend API...");
      
      // Use the default onboarding@resend.dev email as the sender address
      // until alwaslsaudi.com domain is verified
      const emailResponse = await resend.emails.send({
        from: `نظام دعم الوصل <onboarding@resend.dev>`,
        to: [admin_email],
        subject: `تذكرة جديدة: ${ticket_id} - ${priorityLabel}`,
        html: emailHtml,
      });
      
      console.log("Email sent successfully:", emailResponse);

      return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (emailError: any) {
      console.error("Email error details:", emailError);
      console.error("Error stack:", emailError.stack);
      
      // Return more detailed error information
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to send email: ${emailError.message}`,
          details: emailError.stack
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
    console.error("Error stack:", error.stack);
    
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
