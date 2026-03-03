const STORAGE_KEY = 'terminal-theme';

const themes = [
  { name: 'Dark', file: 'dark.css' },
  { name: 'Light', file: 'light.css' },
  { name: 'Green Matrix', file: 'green-matrix.css' },
  { name: 'Ubuntu', file: 'ubuntu.css' },
  { name: 'Dracula', file: 'dracula.css' },
];

function applyTheme(theme) {
  document.getElementById('theme').href = `css/themes/${theme.file}`;
  localStorage.setItem(STORAGE_KEY, theme.name);
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const theme = themes.find(t => t.name === saved) || themes[0];
  applyTheme(theme);
}

export function setTheme(number) {
  if (!Number.isInteger(number) || number < 1 || number > themes.length) {
    return `Invalid theme number. Choose between 1 and ${themes.length}.`;
  }
  const theme = themes[number - 1];
  applyTheme(theme);
  return `Theme changed to ${theme.name}.`;
}

export function getThemeList() {
  const lines = ['Available themes:', ''];
  themes.forEach((t, i) => {
    const label = i === 0 ? `${t.name} (default)` : t.name;
    lines.push(`  ${i + 1}. ${label}`);
  });
  lines.push('', 'Usage: themes set &lt;number&gt;', 'eg: themes set 3');
  return lines.join('<br>');
}
