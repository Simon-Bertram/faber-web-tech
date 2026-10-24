/** Cloudflare Workers types clash with DOM HTML*Element; cast via unknown. */
export function getById(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element #${id}`);
  }
  return element as unknown as HTMLElement;
}

export function getSelect(id: string): HTMLSelectElement {
  const element = getById(id);
  if (element.tagName !== "SELECT") {
    throw new Error(`Expected select #${id}`);
  }
  return element as unknown as HTMLSelectElement;
}

export function getInput(id: string): HTMLInputElement {
  const element = getById(id);
  if (element.tagName !== "INPUT") {
    throw new Error(`Expected input #${id}`);
  }
  return element as unknown as HTMLInputElement;
}

export function getTextArea(id: string): HTMLTextAreaElement {
  const element = getById(id);
  if (element.tagName !== "TEXTAREA") {
    throw new Error(`Expected textarea #${id}`);
  }
  return element as unknown as HTMLTextAreaElement;
}

export function getForm(id: string): HTMLFormElement {
  const element = getById(id);
  if (element.tagName !== "FORM") {
    throw new Error(`Expected form #${id}`);
  }
  return element as unknown as HTMLFormElement;
}
