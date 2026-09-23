declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

let widgetPromise: Promise<void> | null = null;

export function loadCalendlyWidget(): Promise<void> {
  if (widgetPromise) return widgetPromise;

  widgetPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-calendly]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      link.setAttribute("data-calendly", "true");
      document.head.appendChild(link);
    }

    if (window.Calendly) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Calendly widget"));
    document.body.appendChild(script);
  });

  return widgetPromise;
}

export async function openCalendlyPopup(url: string) {
  await loadCalendlyWidget();
  window.Calendly?.initPopupWidget({ url });
}
