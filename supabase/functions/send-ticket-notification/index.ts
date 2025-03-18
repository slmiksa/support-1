
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    const emailResponse = await resend.emails.send({
      from: "WSL Support System <onboarding@resend.dev>", // Update this with your verified domain
      to: [admin_email],
      subject: `تذكرة جديدة: ${ticket_id}`,
      html: `
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
      `,
    });

    console.log("Email notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
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
