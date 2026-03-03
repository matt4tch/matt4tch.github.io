import { content } from '../data/content.js';
import { getThemeList, setTheme } from './themes.js';

export const commands = {
  welcome(args, animate = false) {
    const lines = [];
    for (const artLine of content.ascii) {
      lines.push(`<span class="ascii-art">${artLine}</span>`);
    }
    lines.push('');
    lines.push(content.tagline);
    lines.push('');
    lines.push(
      `Type '<span style="color: var(--accent-color)">help</span>' to see available commands.`
    );

    if (animate) {
      return lines.map((l) => `<div class="typing-line">${l}</div>`).join('');
    }
    return lines.join('<br>');
  },

  help(args) {
    const cmds = [
      ['welcome', 'Display welcome message'],
      ['about', 'Who I am'],
      ['projects', 'My pinned projects'],
      ['education', 'My academic background'],
      ['resume', 'View my resume'],
      ['socials', 'My social links'],
      ['themes', 'Change the terminal theme'],
      ['history', 'Show command history'],
      ['clear', 'Clear the terminal'],
    ];
    const maxLen = Math.max(...cmds.map(([name]) => name.length));
    const headerName = 'Command'.padEnd(maxLen + 2);
    const separatorName = '-------'.padEnd(maxLen + 2);
    const rows = [
      `  <span style="color: var(--accent-color)">${headerName}</span> Description`,
      `  ${separatorName} -----------`,
    ];
    cmds.forEach(([name, desc]) => {
      rows.push(`  <span style="color: var(--accent-color)">${name.padEnd(maxLen + 2)}</span> ${desc}`);
    });
    return rows.join('<br>');
  },

  about(args) {
    return content.about
      .map((line) => (line === '' ? '&nbsp;' : line))
      .join('<br>');
  },

  education(args) {
    const e = content.education;
    return [
      `<span style="color: var(--accent-color)">${e.university}</span>`,
      e.degree,
      `Term: ${e.term}`,
    ].join('<br>');
  },

  projects(args) {
    if (args[0] === 'go' && args[1]) {
      const idx = parseInt(args[1], 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= content.projects.length) {
        return `Invalid project number. Please enter a number between 1 and ${content.projects.length}.`;
      }
      window.open(content.projects[idx].url, '_blank');
      return `Opening ${content.projects[idx].name} in a new tab...`;
    }

    const maxName = Math.max(...content.projects.map((p) => p.name.length));
    const lines = ['My pinned projects:', ''];

    content.projects.forEach((project, i) => {
      const num = `${i + 1}.`;
      const name = project.name.padEnd(maxName + 2);
      lines.push(
        `  ${num} <span style="color: var(--accent-color)">${name}</span> ${project.description} <span style="color: var(--link-color)">[${project.language}]</span>`
      );
    });

    lines.push('');
    lines.push('Usage: projects go &lt;number&gt;');
    lines.push('eg: projects go 1');

    return lines.join('<br>');
  },

  socials(args) {
    if (args[0] === 'go' && args[1]) {
      const idx = parseInt(args[1], 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= content.socials.length) {
        return `Invalid social number. Please enter a number between 1 and ${content.socials.length}.`;
      }
      window.open(content.socials[idx].url, '_blank');
      return `Opening ${content.socials[idx].name} in a new tab...`;
    }

    const maxName = Math.max(...content.socials.map((s) => s.name.length));
    const lines = ['My social links:', ''];

    content.socials.forEach((social, i) => {
      const num = `${i + 1}.`;
      const name = social.name.padEnd(maxName + 2);
      const displayUrl = social.url.replace(/^mailto:/, '');
      lines.push(
        `  ${num} <span style="color: var(--accent-color)">${name}</span> ${displayUrl}`
      );
    });

    lines.push('');
    lines.push('Usage: socials go &lt;social-no&gt;');
    lines.push('eg: socials go 1');

    return lines.join('<br>');
  },

  resume(args) {
    if (args[0] === 'download') {
      const a = document.createElement('a');
      a.href = 'assets/resume.pdf';
      a.download = 'Matthew_Tchouikine_Resume.pdf';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return 'Downloading resume...';
    }

    const lines = content.resumeSummary.map((line) =>
      line === '' ? '&nbsp;' : line
    );
    lines.push('');
    lines.push(
      `Type '<span style="color: var(--accent-color)">resume download</span>' to download the full PDF.`
    );

    return lines.join('<br>');
  },

  themes(args) {
    if (args[0] === 'set' && args[1]) {
      return setTheme(parseInt(args[1], 10));
    }
    return getThemeList();
  },
};
