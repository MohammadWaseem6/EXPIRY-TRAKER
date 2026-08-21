require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendInvitationEmail = async (to, name, role, tempPassword, branch) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb;"> Expiry Tracker</h2>
      <h3>Welcome, ${name}!</h3>
      <p>You have been invited to join <strong>Expiry Tracker</strong> as a <strong>${role}</strong>.</p>
      <p><strong>Branch:</strong> ${branch}</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Your temporary password:</strong></p>
        <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 5px 0;">${tempPassword}</p>
      </div>
      <p>Please login using your email and the password above.</p>
      <a href="${frontendUrl}/login" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
        Login to Expiry Tracker
      </a>
      <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
        We recommend changing your password after your first login.
      </p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Expiry Tracker <onboarding@resend.dev>",
      to: [to],
      subject: `You have been invited to Expiry Tracker (${role})`,
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Invitation email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendInvitationEmail };