import { Resend } from "resend";
import mjml2html from "mjml";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

// Init Resend client
const resend = new Resend(process.env.RESEND);

export const sendEmail = async ({ email, randomToken, verifyEmailLink }) => {
  try {
    // Load MJML template
    const templatePath = path.join(dirName, "../emails", "verify-email.mjml");
    let mjmlTemplate = await fs.readFile(templatePath, "utf8");

    // Replace placeholders
    mjmlTemplate = mjmlTemplate
      .replace(/{{TOKEN}}/g, randomToken)
      .replace(/{{VERIFY_LINK}}/g, verifyEmailLink);

    // Convert MJML → HTML
    const { html, errors } = mjml2html(mjmlTemplate);
    if (errors.length) {
      console.error("MJML Errors:", errors);
    }

    // Send email via Resend
    const data = await resend.emails.send({
      from: "URL SHORTNER <onboarding@resend.dev>", // change to verified domain
      to: email,
      subject: "Verify your email",
      html,
    });

  } catch (err) {
    console.error("❌ Email error:", err);
  }
};
