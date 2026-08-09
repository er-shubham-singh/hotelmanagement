import { wrapEmail, codeBlock } from "../baseTemplate.js";

export const emailOtpEmail = ({ code }) => {
  const html = wrapEmail({
    title: "Verify your email",
    preheader: "Your Natasha Hotels verification code",
    bodyHtml: `
      <h1 style="margin:0 0 12px; font-size:20px; color:#17261e;">Verify your email</h1>
      <p style="margin:0 0 4px; color:#334155; font-size:14px; line-height:1.6;">
        Use this code to verify your email and finish creating your Natasha Hotels account.
      </p>
      ${codeBlock(code)}
      <p style="margin:0; color:#94a3b8; font-size:12px;">
        Valid for 5 minutes. If you didn't request this, you can safely ignore this email.
      </p>
    `,
  });

  return { subject: "Your Natasha Hotels verification code", html };
};

export default emailOtpEmail;
