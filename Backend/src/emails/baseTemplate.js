// Shared HTML shell for all outgoing email — on-brand (teal/amber), responsive,
// table-based layout for maximum email-client compatibility.
const BRAND = {
  primary: "#0f766e",
  primaryDark: "#0d5f58",
  accent: "#f59e0b",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  bg: "#f7faf9",
};

export const wrapEmail = ({ title, preheader = "", bodyHtml, ctaLabel, ctaUrl }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background:${BRAND.bg}; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
    <span style="display:none; font-size:1px; color:${BRAND.bg}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid ${BRAND.border};">
            <tr>
              <td style="background:${BRAND.primary}; padding:20px 28px;">
                <table role="presentation" width="100%">
                  <tr>
                    <td style="color:#ffffff; font-size:18px; font-weight:700; font-family: Georgia, serif;">
                      StayByHour
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 28px;">
                ${bodyHtml}
                ${
                  ctaLabel && ctaUrl
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                        <tr>
                          <td style="border-radius:10px; background:${BRAND.accent};">
                            <a href="${ctaUrl}" style="display:inline-block; padding:12px 24px; color:#ffffff; font-weight:600; text-decoration:none; font-size:14px;">${ctaLabel}</a>
                          </td>
                        </tr>
                      </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 28px; border-top:1px solid ${BRAND.border};">
                <p style="margin:0; color:${BRAND.muted}; font-size:12px;">
                  StayByHour — hourly &amp; full-day hotel stays across India.<br />
                  Need help? Reply to this email or contact support@staybyhour.com
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const codeBlock = (code) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
    <tr>
      <td style="background:#f1f5f4; border: 1px dashed #cbd5e1; border-radius:12px; padding: 16px 24px;">
        <span style="font-size:28px; font-weight:700; letter-spacing:6px; color:${BRAND.text}; font-family: monospace;">${code}</span>
      </td>
    </tr>
  </table>
`;

export const BRAND_COLORS = BRAND;

export default { wrapEmail, codeBlock, BRAND_COLORS };
