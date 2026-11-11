// The CodeQuest mark: three stations on a line. Used by the top bar and by the password screen.
export function brandMark() {
  const t = document.createElement('template');
  t.innerHTML = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="8" class="bm-bg"/><path d="M10 7.5v17" class="bm-rail"/><circle cx="10" cy="7.5" r="2.9" fill="var(--l-foundations)" class="bm-stop"/><circle cx="10" cy="16" r="2.9" fill="var(--l-flow)" class="bm-stop"/><circle cx="10" cy="24.5" r="2.9" fill="var(--l-functions)" class="bm-stop"/><path d="M15.5 7.5h8.5M15.5 16h6.5M15.5 24.5h8.5" class="bm-label"/></svg>`;
  return t.content.firstChild;
}
