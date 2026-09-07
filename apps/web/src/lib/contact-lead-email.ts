const CONTACT_INBOX = "contact@faberwebtech.com";
const CONTACT_FROM_NAME = "Faber Web Tech";

export const projectTypeLabels = {
  "ai-automation": "AI Automation",
  "not-sure": "Not sure yet",
  "seo-geo": "SEO & GEO",
  "web-app": "Web App",
  website: "Modern Website",
} as const;

export const budgetLabels = {
  "": "Not specified",
  "5k-15k": "£5k–£15k",
  "15k-40k": "£15k–£40k",
  "40k-plus": "£40k+",
  "not-sure": "Not sure",
  "under-5k": "Under £5k",
} as const;

export const timelineLabels = {
  "": "Not specified",
  "1-3-months": "1–3 months",
  "3-6-months": "3–6 months",
  asap: "ASAP",
  exploring: "Exploring",
} as const;

export type ProjectType = keyof typeof projectTypeLabels;
export type Budget = keyof typeof budgetLabels;
export type Timeline = keyof typeof timelineLabels;

export interface ContactLead {
  budget: Budget;
  company: string;
  email: string;
  goals: string;
  name: string;
  projectType: ProjectType;
  timeline: Timeline;
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
  const projectType = projectTypeLabels[lead.projectType];
  const budget = budgetLabels[lead.budget];
  const timeline = timelineLabels[lead.timeline];
  const company = displayOrDash(lead.company);
  const subject = `New lead: ${projectType} — ${lead.name}`;

  const text = [
    "New project enquiry from the contact form.",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Company: ${company}`,
    `Project type: ${projectType}`,
    `Budget: ${budget}`,
    `Timeline: ${timeline}`,
    "",
    "Goals / desires:",
    lead.goals,
  ].join("\n");

  const html = `
    <h1>New project enquiry</h1>
    <p>A lead submitted the contact form.</p>
    <table>
      <tr><th align="left">Name</th><td>${escapeHtml(lead.name)}</td></tr>
      <tr><th align="left">Email</th><td>${escapeHtml(lead.email)}</td></tr>
      <tr><th align="left">Company</th><td>${escapeHtml(company)}</td></tr>
      <tr><th align="left">Project type</th><td>${escapeHtml(projectType)}</td></tr>
      <tr><th align="left">Budget</th><td>${escapeHtml(budget)}</td></tr>
      <tr><th align="left">Timeline</th><td>${escapeHtml(timeline)}</td></tr>
    </table>
    <h2>Goals / desires</h2>
    <p>${escapeHtml(lead.goals).replaceAll("\n", "<br>")}</p>
  `;

  return { html, subject, text };
}
