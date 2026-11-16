/** Public Turnstile sitekey (safe to embed in the browser). */
export const TURNSTILE_SITEKEY = "0x4AAAAAAEGQrjTl9Eh2AoWh";

interface TurnstileApi {
  getResponse: (widgetId: string) => string;
  render: (
    container: string | HTMLElement,
    options: {
      action?: string;
      sitekey: string;
    }
  ) => string;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export async function waitForTurnstile(
  timeoutMs = 15_000
): Promise<TurnstileApi> {
  if (window.turnstile) {
    return window.turnstile;
  }

  return await new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (window.turnstile) {
        clearInterval(timer);
        resolve(window.turnstile);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        clearInterval(timer);
        reject(new Error("Turnstile failed to load"));
      }
    }, 50);
  });
}

export async function renderTurnstileWidget(
  containerSelector: string,
  action: string
): Promise<string> {
  const turnstile = await waitForTurnstile();
  return turnstile.render(containerSelector, {
    action,
    sitekey: TURNSTILE_SITEKEY,
  });
}

export function getTurnstileResponse(widgetId: string): string {
  return window.turnstile?.getResponse(widgetId)?.trim() ?? "";
}

export function resetTurnstileWidget(widgetId: string | undefined): void {
  if (widgetId === undefined || !window.turnstile) {
    return;
  }
  window.turnstile.reset(widgetId);
}
