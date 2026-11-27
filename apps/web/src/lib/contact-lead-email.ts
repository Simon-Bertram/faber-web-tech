const CONTACT_INBOX = "contact@faberwebtech.com";
const CONTACT_FROM_NAME = "Faber Web Tech";

export interface ContactLead {
  email: string;
  /** Experiment attribution for blinded inbox scoring — footer only, not subject. */
  experimentOffer?: string;
  experimentVariant?: string;
  message: string;
  name: string;
  website: string;
}

export { CONTACT_FROM_NAME, CONTACT_INBOX };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function displayOrDash(value: string): string {
  return value.trim() === "" ? "—" : value;
}

export function buildContactLeadEmail(lead: ContactLead): {
  html: string;
  subject: string;
  text: string;
} {
  const website = displayOrDash(lead.website);
  const subject = `New lead: ${lead.name}`;

  const experimentFooter =
    lead.experimentVariant && lead.experimentOffer
      ? [
          "",
          "—",
          `Experiment: ${lead.experimentVariant} (${lead.experimentOffer})`,
        ]
      : [];

  const text = [
    "New enquiry from the contact form.",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Website: ${website}`,
    "",
    "What they need help with:",
    lead.message,
    ...experimentFooter,
  ].join("\n");

  const experimentHtml =
    lead.experimentVariant && lead.experimentOffer
      ? `<p style="margin-top:2rem;color:#666;font-size:12px">Experiment: ${escapeHtml(lead.experimentVariant)} (${escapeHtml(lead.experimentOffer)})</p>`
      : "";

  const html = `
    <h1>New enquiry</h1>
    <p>A lead submitted the contact form.</p>
    <table>
      <tr><th align="left">Name</th><td>${escapeHtml(lead.name)}</td></tr>
      <tr><th align="left">Email</th><td>${escapeHtml(lead.email)}</td></tr>
      <tr><th align="left">Website</th><td>${escapeHtml(website)}</td></tr>
    </table>
    <h2>What they need help with</h2>
    <p>${escapeHtml(lead.message).replaceAll("\n", "<br>")}</p>
    ${experimentHtml}
  `;

  return { html, subject, text };
}
