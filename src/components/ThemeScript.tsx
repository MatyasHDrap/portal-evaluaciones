// Inline script to prevent flash of wrong theme
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
