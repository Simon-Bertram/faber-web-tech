import { orpc } from "../lib/orpc";

// Turnstile injects this API after its script loads (see ContactForm.astro).
declare global {
  interface Window {
    turnstile?: {
      reset: (widgetId?: string) => void;
    };
  }
}

const form = document.querySelector("#contact-form")!;
const formError = document.querySelector("#form-error")!;
const formSuccess = document.querySelector("#form-success")!;
const submitButton = form.querySelector('button[type="submit"]')!;

// Tokens are single-use; reset so the user can retry after an error.
function resetTurnstile() {
  globalThis.turnstile?.reset();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stay on the page; we submit via oRPC instead

  formError.classList.add("hidden");
  formSuccess.classList.add("hidden");
  submitButton.disabled = true;
  submitButton.textContent = "Sending…";

  const formData = new FormData(form);
  // Hidden field Turnstile fills after the challenge succeeds.
  const turnstileToken = String(
    formData.get("cf-turnstile-response") ?? ""
  ).trim();

  if (!turnstileToken) {
    formError.textContent = "Please complete the verification challenge.";
    formError.classList.remove("hidden");
    submitButton.disabled = false;
    submitButton.textContent = "Send message";
    return;
  }

  try {
    const company = String(formData.get("company") ?? "").trim();
    // Typed RPC → packages/api contact.submit (siteverify, D1, Resend).
    await orpc.contact.submit({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      company: company || undefined,
      projectType: String(formData.get("projectType") ?? "") as
        "Website" | "Web app" | "E-commerce" | "Redesign" | "Other",
      budget: String(formData.get("budget") ?? "") as
        "Under £5k" | "£5k–£15k" | "£15k–£50k" | "£50k+" | "Not sure",
      message: String(formData.get("message") ?? "").trim(),
      turnstileToken,
    });

    form.reset();
    resetTurnstile();
    formSuccess.textContent = "Thanks — your message is on its way.";
    formSuccess.classList.remove("hidden");
  } catch {
    formError.textContent =
      "Something went wrong. Please try again in a moment.";
    formError.classList.remove("hidden");
    resetTurnstile();
  } finally {
    // Always restore the button, success or failure.
    submitButton.disabled = false;
    submitButton.textContent = "Send message";
  }
});
