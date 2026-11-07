const THEME_KEY = "asalib_theme";

export function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  const current = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-bs-theme", current);
  localStorage.setItem(THEME_KEY, current);
  window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme: current } }));
  return current;
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute("data-bs-theme") || getSavedTheme();
  const next = current === "dark" ? "light" : "dark";
  return applyTheme(next);
}

export function initTheme() {
  return applyTheme(getSavedTheme());
}

export default {
  getSavedTheme,
  applyTheme,
  toggleTheme,
  initTheme,
};
