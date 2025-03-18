
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
  admin_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticket_id, employee_id, branch, description, admin_email }: TicketNotificationRequest = await req.json();

    console.log(`Sending notification for ticket ${ticket_id} to ${admin_email}`);

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
    
    // Using the provided email configuration
    const emailHost = "ex.alwaslsaudi.com";
    const emailPort = 587;
    const emailUsername = "help@alwaslsaudi.com";
    const emailPassword = "vlh4pefmnx$gtcdsOzwj";
    
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

    // Create the email message
    const emailHtml = `
      <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
        <h1>تم إنشاء تذكرة دعم فني جديدة</h1>
        <p>تم إنشاء تذكرة دعم فني جديدة في النظام. إليك التفاصيل:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>رقم التذكرة:</strong> ${ticket_id}</p>
          <p><strong>الرقم الوظيفي:</strong> ${employee_id}</p>
          <p><strong>الفرع:</strong> ${branch}</p>
          <p><strong>وصف المشكلة:</strong> ${truncatedDescription}</p>
        </div>
        <p>يرجى الدخول إلى <a href="https://wsl-support.netlify.app/admin/login">لوحة التحكم</a> للاطلاع على التذكرة والرد عليها.</p>
        <p>شكراً لك،<br>نظام دعم WSL</p>
      </div>
    `;

    // Send the email
    try {
      await client.send({
        from: emailUsername,
        to: admin_email,
        subject: `تذكرة جديدة: ${ticket_id}`,
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
