import Script from "next/script";

const themeScript = `
(function() {
  try {
    var stored = window.localStorage.getItem('startupfiles-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {}
})();
`;

export function ThemeScript() {
  return <Script id="startupfiles-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
