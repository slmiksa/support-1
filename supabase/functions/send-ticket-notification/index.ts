
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticket_id, employee_id, branch, description, priority, admin_email }: TicketNotificationRequest = await req.json();

    console.log(`Sending notification for ticket ${ticket_id} to ${admin_email}`);
    console.log(`Ticket priority: ${priority || 'normal'}`);

    // Validate inputs
    if (!ticket_id || !employee_id || !branch || !description || !admin_email) {
      throw new Error("Missing required fields");
    }

    // Create a truncated description for the email
    const truncatedDescription = description.length > 100 
      ? `${description.substring(0, 100)}...` 
      : description;

    // SMTP client configuration - using your provided credentials
    const client = new SmtpClient();
    
    // Using the provided email configuration (retrieving from environment variables for security)
    const emailHost = Deno.env.get("EMAIL_HOST") || "ex.alwaslsaudi.com";
    const emailPort = parseInt(Deno.env.get("EMAIL_PORT") || "587");
    const emailUsername = Deno.env.get("EMAIL_USERNAME") || "help@alwaslsaudi.com";
    const emailPassword = Deno.env.get("EMAIL_PASSWORD") || "vlh4pefmnx$gtcdsOzwj";
    
    console.log(`Connecting to SMTP server: ${emailHost}:${emailPort}`);
    
    try {
      await client.connectTLS({
        hostname: emailHost,
        port: emailPort,
        username: emailUsername,
        password: emailPassword,
      });
      
      console.log("Successfully connected to SMTP server");
    } catch (smtpError) {
      console.error("SMTP connection error:", smtpError);
      throw new Error(`Failed to connect to SMTP server: ${smtpError.message}`);
    }

    // Get priority label in Arabic
    const priorityLabels = {
      urgent: 'عاجلة',
      medium: 'متوسطة',
      normal: 'عادية'
    };
    const priorityLabel = priorityLabels[priority as keyof typeof priorityLabels] || 'عادية';

    // Create the email message with enhanced styling and priority information
    const emailHtml = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
        <h1 style="color: #15437f;">تم إنشاء تذكرة دعم فني جديدة</h1>
        <p>تم إنشاء تذكرة دعم فني جديدة في النظام. إليك التفاصيل:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #15437f;">
          <p><strong>رقم التذكرة:</strong> ${ticket_id}</p>
          <p><strong>الرقم الوظيفي:</strong> ${employee_id}</p>
          <p><strong>الفرع:</strong> ${branch}</p>
          <p><strong>الأهمية:</strong> <span style="background-color: ${priority === 'urgent' ? '#ffebee' : priority === 'medium' ? '#fff8e1' : '#e8f5e9'}; padding: 3px 8px; border-radius: 4px; color: ${priority === 'urgent' ? '#c62828' : priority === 'medium' ? '#ff8f00' : '#2e7d32'};">${priorityLabel}</span></p>
          <p><strong>وصف المشكلة:</strong> ${truncatedDescription}</p>
        </div>
        <p>يرجى الدخول إلى <a href="https://wsl-support.netlify.app/admin/login" style="color: #15437f; text-decoration: none; font-weight: bold;">لوحة التحكم</a> للاطلاع على التذكرة والرد عليها.</p>
        <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; color: #777; font-size: 12px;">
          تم إرسال هذا البريد الإلكتروني تلقائياً من نظام دعم الوصل. يرجى عدم الرد على هذا البريد.
        </p>
      </div>
    `;

    // Send the email
    try {
      await client.send({
        from: emailUsername,
        to: admin_email,
        subject: `تذكرة جديدة: ${ticket_id} - ${priorityLabel}`,
        content: "تم إنشاء تذكرة دعم فني جديدة",
        html: emailHtml,
      });
      
      console.log("Email sent successfully to", admin_email);
    } catch (sendError) {
      console.error("Email sending error:", sendError);
      throw new Error(`Failed to send email: ${sendError.message}`);
    } finally {
      try {
        await client.close();
        console.log("SMTP connection closed");
      } catch (closeError) {
        console.error("Error closing SMTP connection:", closeError);
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
