const SCOPE_ROOT_ID = "auth-widget-root";

function createScopeRoot(): HTMLElement {
  const el = document.createElement("div");
  el.id = SCOPE_ROOT_ID;
  document.body.appendChild(el);
  return el;
}

// Module-level, browser-only — Next.js evaluates "use client" modules during
// SSR too, but this branch never runs there. Resolved once, synchronously,
// before any component can possibly render, so there's no flash/remount the
// first time the dialog opens. Paired with `important: "#auth-widget-root"`
// in tailwind.config.js — see Planning/V2/AuthConsentWidgetTailwindScoping.md
// for why this exists: without a scoped portal target, this package's own
// Tailwind output collides with whatever the consuming app's own CSS
// generates for the same utility class names.
export const scopeRoot: HTMLElement | undefined =
  typeof document !== "undefined"
    ? (document.getElementById(SCOPE_ROOT_ID) ?? createScopeRoot())
    : undefined;
