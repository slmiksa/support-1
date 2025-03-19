
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Using a different SMTP client library that's compatible with Deno Deploy
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

    // Get priority label in Arabic
    const priorityLabels = {
      urgent: 'عاجلة',
      medium: 'متوسطة',
      normal: 'عادية'
    };
    const priorityLabel = priorityLabels[priority as keyof typeof priorityLabels] || 'عادية';

    // Configure SMTP client
    const emailHost = Deno.env.get("EMAIL_HOST") || "ex.alwaslsaudi.com";
    const emailPort = parseInt(Deno.env.get("EMAIL_PORT") || "587");
    const emailUsername = Deno.env.get("EMAIL_USERNAME") || "help@alwaslsaudi.com";
    const emailPassword = Deno.env.get("EMAIL_PASSWORD") || "";
    
    console.log(`Email configuration: Host=${emailHost}, Port=${emailPort}, User=${emailUsername}`);
    console.log(`Attempting to send email to ${admin_email}`);

    // Create email HTML content
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

    try {
      // Initialize SMTP client
      const client = new SmtpClient();
      
      console.log("Connecting to SMTP server...");

      // Connect to SMTP server with explicit error handling
      await client.connectTLS({
        hostname: emailHost,
        port: emailPort,
        username: emailUsername,
        password: emailPassword,
      });
      
      console.log("Successfully connected to SMTP server");
      
      // Send the email with explicit error handling
      const sendResult = await client.send({
        from: emailUsername,
        to: admin_email,
        subject: `تذكرة جديدة: ${ticket_id} - ${priorityLabel}`,
        content: "تم إنشاء تذكرة دعم فني جديدة",
        html: emailHtml,
      });
      
      console.log("Email sent successfully:", sendResult);
      
      // Close the connection
      await client.close();
      console.log("SMTP connection closed");

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
