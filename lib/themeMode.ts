/** Gece/gündüz modunu değiştirir ve tercihi kaydeder. */
export function toggleThemeMode(): boolean {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem("theme", next ? "dark" : "light");
  } catch {
    // depolama kapalıysa tercih yalnızca bu oturumda geçerli olur
  }
  return next;
}
