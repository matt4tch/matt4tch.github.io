import { content } from '../data/content.js';

export const commands = {
  welcome(args) {
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
};
