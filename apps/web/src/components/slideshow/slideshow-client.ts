const INTERVAL_MS = 5500;

type SlideData = {
  title: string;
  subheading: string;
  ctaLabel: string;
  ctaUrl: string;
};

function initSlideshow(root: HTMLElement) {
  const images = [...root.querySelectorAll<HTMLElement>("[data-slide-image]")];
  const dots = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-slide-dot]"),
  ];
  const titleEl = root.querySelector<HTMLElement>("[data-slide-title]");
  const subEl = root.querySelector<HTMLElement>("[data-slide-subheading]");
  const ctaWrap = root.querySelector<HTMLElement>("[data-slide-cta-wrap]");
  const ctaEl = root.querySelector<HTMLAnchorElement>("[data-slide-cta]");

  let slides: SlideData[] = [];
  try {
    slides = JSON.parse(root.dataset.slides ?? "[]") as SlideData[];
  } catch {
    slides = [];
  }

  const count = Math.max(images.length, slides.length);

  if (count < 2) {
    return;
  }

  let index = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function setActive(next: number) {
    index = ((next % count) + count) % count;
    const slide = slides[index];

    for (const image of images) {
      const i = Number(image.dataset.slideIndex);
      image.classList.toggle("opacity-100", i === index);
      image.classList.toggle("opacity-0", i !== index);
    }

    if (titleEl && slide) {
      titleEl.textContent = slide.title;
    }

    if (subEl && slide) {
      subEl.textContent = slide.subheading;
      subEl.hidden = !slide.subheading;
    }

    if (ctaWrap && ctaEl && slide) {
      const hasCta = Boolean(slide.ctaUrl && slide.ctaLabel);
      ctaWrap.hidden = !hasCta;
      if (hasCta) {
        ctaEl.href = slide.ctaUrl;
        ctaEl.textContent = slide.ctaLabel;
      }
    }

    for (const dot of dots) {
      const i = Number(dot.dataset.slideIndex);
      const isActive = i === index;
      dot.setAttribute("aria-pressed", isActive ? "true" : "false");
      dot.classList.toggle("bg-primary-container", isActive);
      dot.classList.toggle("w-8", isActive);
      dot.classList.toggle("bg-on-surface/30", !isActive);
      dot.classList.toggle("hover:bg-on-surface/50", !isActive);
      dot.classList.toggle("w-2", !isActive);
    }
  }

  function stop() {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }

  function start() {
    if (prefersReduced || document.hidden) {
      return;
    }
    stop();
    timer = setInterval(() => {
      setActive(index + 1);
    }, INTERVAL_MS);
  }

  for (const dot of dots) {
    dot.addEventListener("click", () => {
      setActive(Number(dot.dataset.slideIndex));
      start();
    });
  }

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget as Node | null)) {
      start();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  start();
}

export function initAllSlideshows() {
  for (const root of document.querySelectorAll<HTMLElement>(
    "[data-slideshow]"
  )) {
    initSlideshow(root);
  }
}

initAllSlideshows();
