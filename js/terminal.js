import { commands } from './commands.js';

class Terminal {
  constructor() {
    this.output = document.getElementById('output');
    this.input = document.getElementById('command-input');
    this.terminal = document.getElementById('terminal');
    this.init();
  }

  init() {
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.terminal.addEventListener('click', () => this.input.focus());
    const welcomeHtml = commands.welcome([]);
    if (welcomeHtml) this.appendOutput(welcomeHtml);
    this.input.focus();
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      this.handleCommand();
    }
  }

  handleCommand() {
    const raw = this.input.value.trim();
    this.appendPromptLine(raw);
    this.input.value = '';

    if (!raw) {
      this.scrollToBottom();
      return;
    }

    const parts = raw.split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commandName === 'clear') {
      this.output.innerHTML = '';
      return;
    }

    if (commands[commandName]) {
      const result = commands[commandName](args);
      this.appendOutput(result);
    } else {
      this.appendOutput(
        `command not found: ${this.escapeHtml(commandName)}. Type 'help' to see available commands.`
      );
    }
  }

  appendPromptLine(text) {
    const div = document.createElement('div');
    div.classList.add('output-command');
    div.innerHTML =
      `<span class="prompt"><span class="prompt-user">visitor</span>@<span class="prompt-host">matt4tch.dev</span>:~$</span> ` +
      `<span class="command-text">${this.escapeHtml(text)}</span>`;
    this.output.appendChild(div);
  }

  appendOutput(html) {
    const div = document.createElement('div');
    div.classList.add('output-section');
    div.innerHTML = html;
    this.output.appendChild(div);
    this.scrollToBottom();
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

new Terminal();
