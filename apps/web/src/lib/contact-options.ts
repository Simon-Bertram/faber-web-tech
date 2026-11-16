/**
 * Single source of truth for contact form option keys and labels.
 * UI selects/radios, Zod enums in the action, and lead-email copy all derive from here
 * so adding a budget/timeline/project type only requires one edit.
 */

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

export const PROJECT_TYPE_VALUES = Object.keys(projectTypeLabels) as [
  ProjectType,
  ...ProjectType[],
];

export const BUDGET_VALUES = Object.keys(budgetLabels) as [Budget, ...Budget[]];

export const TIMELINE_VALUES = Object.keys(timelineLabels) as [
  Timeline,
  ...Timeline[],
];

/** Empty-select placeholders differ from email's "Not specified". */
const BUDGET_SELECT_EMPTY_LABEL = "Select a range";
const TIMELINE_SELECT_EMPTY_LABEL = "Select a timeline";

export const projectTypeOptions = PROJECT_TYPE_VALUES.map((id) => ({
  id,
  label: projectTypeLabels[id],
}));

export const budgetOptions = BUDGET_VALUES.map((value) => ({
  label: value === "" ? BUDGET_SELECT_EMPTY_LABEL : budgetLabels[value],
  value,
}));

export const timelineOptions = TIMELINE_VALUES.map((value) => ({
  label: value === "" ? TIMELINE_SELECT_EMPTY_LABEL : timelineLabels[value],
  value,
}));
