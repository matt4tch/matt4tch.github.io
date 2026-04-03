import { commands } from './commands.js';
import { initTheme } from './themes.js';
import { VimMode } from './vim.js';

class Terminal {
  constructor() {
    this.output = document.getElementById('output');
    this.input = document.getElementById('command-input');
    this.terminal = document.getElementById('terminal');
    this.modeIndicator = document.getElementById('vim-mode');
    this.cursorBlock = document.getElementById('cursor-block');
    this.history = [];
    this.historyIndex = -1;
    this.animationTimers = [];
    this.charWidth = this.measureCharWidth();
    this.vimActivated = false;
    this.vim = new VimMode(this.input, (mode) => this.onVimModeChange(mode));
    this.init();
  }

  init() {
    this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.input.addEventListener('input', () => this.updateCursor());
    this.input.addEventListener('click', () => this.updateCursor());
    this.input.addEventListener('select', () => this.updateCursor());
    this.terminal.addEventListener('click', () => this.input.focus());
    initTheme();
    this.executeWelcome(true);
    this.input.focus();
    this.updateCursor();
  }

  measureCharWidth() {
    const span = document.createElement('span');
    span.style.font = getComputedStyle(this.input).font;
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.textContent = 'M';
    document.body.appendChild(span);
    const width = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    return width;
  }

  updateCursor() {
    requestAnimationFrame(() => {
      const pos = this.input.selectionStart || 0;
      this.cursorBlock.style.left = `${pos * this.charWidth}px`;
      this.cursorBlock.classList.toggle('normal', this.vim.isNormal);
    });
  }

  onVimModeChange(mode) {
    if (mode === 'normal') this.vimActivated = true;
    this.modeIndicator.textContent = this.vimActivated ? (mode === 'normal' ? '[N]' : '[I]') : '';
    this.input.dataset.vimMode = mode;
    this.updateCursor();
  }

  handleKeyDown(e) {
    // Vim handles Escape and all normal-mode keys
    if (this.vim.handle(e)) {
      this.updateCursor();
      return;
    }

    if (e.ctrlKey) {
      switch (e.key) {
        case 'c':
          e.preventDefault();
          this.appendPromptLine(this.input.value + '^C');
          this.input.value = '';
          this.historyIndex = -1;
          this.scrollToBottom();
          break;
        case 'l':
          e.preventDefault();
          this.clearPendingAnimations();
          this.output.innerHTML = '';
          break;
        case 'u':
          e.preventDefault();
          this.input.value = this.input.value.substring(this.input.selectionStart);
          this.input.setSelectionRange(0, 0);
          break;
        case 'k':
          e.preventDefault();
          this.input.value = this.input.value.substring(0, this.input.selectionStart);
          break;
        case 'a':
          e.preventDefault();
          this.input.setSelectionRange(0, 0);
          break;
        case 'e':
          e.preventDefault();
          this.input.setSelectionRange(this.input.value.length, this.input.value.length);
          break;
      }
      this.updateCursor();
      return;
    }

    switch (e.key) {
      case 'Enter':
        this.handleCommand();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.navigateHistory(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.navigateHistory(1);
        break;
      case 'Tab':
        e.preventDefault();
        this.autoComplete();
        break;
    }
    this.updateCursor();
  }

  handleCommand() {
    const raw = this.input.value.trim();
    this.appendPromptLine(raw);
    this.input.value = '';
    this.vim.setMode('insert');

    if (!raw) {
      this.scrollToBottom();
      return;
    }

    this.history.push(raw);
    this.historyIndex = -1;

    const parts = raw.split(/\s+/);
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commandName === 'clear') {
      this.clearPendingAnimations();
      this.output.innerHTML = '';
      return;
    }

    if (commandName === 'history') {
      this.appendOutput(this.getHistoryOutput());
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

  executeWelcome(animate) {
    const html = commands.welcome([], animate);

    if (animate) {
      const container = document.createElement('div');
      container.classList.add('output-section');
      container.innerHTML = html;
      this.output.appendChild(container);

      const lines = container.querySelectorAll('.typing-line');
      lines.forEach((line, i) => {
        const tid = setTimeout(() => {
          line.classList.add('visible');
        }, i * 80);
        this.animationTimers.push(tid);
      });

      const scrollTid = setTimeout(() => this.scrollToBottom(), lines.length * 80);
      this.animationTimers.push(scrollTid);
    } else {
      this.appendOutput(html);
    }
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;

    if (direction === -1) {
      // Going back in history
      if (this.historyIndex === -1) {
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
      this.input.value = this.history[this.historyIndex];
    } else if (direction === 1) {
      // Going forward in history
      if (this.historyIndex === -1) return;
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = -1;
        this.input.value = '';
      }
    }
  }

  autoComplete() {
    const value = this.input.value;
    const parts = value.split(/\s+/);

    // Only autocomplete the first word (command name)
    if (parts.length > 1) return;

    const partial = parts[0].toLowerCase();
    if (!partial) return;

    const allCommands = [...Object.keys(commands), 'clear', 'history'];
    const matches = allCommands.filter((cmd) => cmd.startsWith(partial));

    if (matches.length === 1) {
      this.input.value = matches[0];
    }
  }

  getHistoryOutput() {
    if (this.history.length === 0) {
      return 'No commands in history.';
    }
    return this.history
      .map((cmd, i) => `  ${i + 1}  ${this.escapeHtml(cmd)}`)
      .join('\n');
  }

  clearPendingAnimations() {
    this.animationTimers.forEach((tid) => clearTimeout(tid));
    this.animationTimers = [];
  }

  scrollToBottom() {
    const body = document.getElementById('terminal-body');
    body.scrollTop = body.scrollHeight;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

new Terminal();
