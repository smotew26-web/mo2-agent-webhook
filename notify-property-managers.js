import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { tenantName, unit, issueSummary, priority, contactEmail, conversationId } = req.body;

  if (!issueSummary) {
    return res.status(400).json({ error: "Missing required field: issueSummary" });
  }

  const pmEmails = process.env.PM_EMAILS?.split(",") || [];
  const fromEmail = process.env.FROM_EMAIL || "no-reply@example.com";

  try {
    await sendgrid.send({
      to: pmEmails,
      from: fromEmail,
      subject: `Maintenance Request from ${tenantName || "Tenant"} - Unit ${unit || ""}`,
      html: `
        <h3>New Maintenance Request</h3>
        <p><strong>Tenant:</strong> ${tenantName || "N/A"}</p>
        <p><strong>Unit:</strong> ${unit || "N/A"}</p>
        <p><strong>Issue:</strong> ${issueSummary}</p>
        <p><strong>Priority:</strong> ${priority || "normal"}</p>
        <p><strong>Contact Email:</strong> ${contactEmail || "N/A"}</p>
        <p><strong>Conversation ID:</strong> ${conversationId || "N/A"}</p>
      `,
    });

    res.status(200).json({ message: "Email sent to property managers successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email." });
  }
}
