/**
 * Minimal vim bindings for a single-line input.
 * Activates only when user presses Escape (no Escape on mobile keyboards).
 *
 * Normal mode: h l w b e 0 $ x i a I A dd dw db cc
 * Insert mode: default (normal typing). Escape to exit.
 */

export class VimMode {
  constructor(input, onModeChange) {
    this.input = input;
    this.onModeChange = onModeChange;
    this.mode = 'insert';
    this.pending = ''; // for multi-key commands (d, c)
  }

  get isNormal() {
    return this.mode === 'normal';
  }

  setMode(mode) {
    this.mode = mode;
    this.pending = '';
    this.onModeChange(mode);
  }

  /**
   * Handle a keydown event. Returns true if the event was consumed.
   */
  handle(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.setMode('normal');
      return true;
    }

    if (this.mode !== 'normal') return false;

    // In normal mode, consume most keys
    const pos = this.input.selectionStart;
    const val = this.input.value;
    const key = e.key;

    // Handle pending operator sequences
    if (this.pending) {
      e.preventDefault();
      if (this.pending.length === 2) {
        // "di" or "ci" + text object key (e.g. "w")
        this.handleTextObject(this.pending[0], key, pos, val);
        this.pending = '';
      } else {
        // "d" or "c" + motion/object key
        const prev = this.pending;
        this.handleOperator(this.pending, key, pos, val);
        // handleOperator may have extended pending to "di"/"ci" — only clear if unchanged
        if (this.pending === prev) this.pending = '';
      }
      return true;
    }

    e.preventDefault();

    switch (key) {
      // Mode switches
      case 'i':
        this.setMode('insert');
        break;
      case 'a':
        this.setMode('insert');
        this.setCursor(Math.min(pos + 1, val.length));
        break;
      case 'I':
        this.setMode('insert');
        this.setCursor(0);
        break;
      case 'A':
        this.setMode('insert');
        this.setCursor(val.length);
        break;

      // Movement
      case 'h':
        this.setCursor(Math.max(pos - 1, 0));
        break;
      case 'l':
        this.setCursor(Math.min(pos + 1, val.length));
        break;
      case '0':
        this.setCursor(0);
        break;
      case '$':
        this.setCursor(val.length);
        break;
      case 'w':
        this.setCursor(this.nextWord(val, pos));
        break;
      case 'b':
        this.setCursor(this.prevWord(val, pos));
        break;
      case 'e':
        this.setCursor(this.endOfWord(val, pos));
        break;

      // Deletion
      case 'x':
        this.input.value = val.substring(0, pos) + val.substring(pos + 1);
        this.setCursor(Math.min(pos, this.input.value.length));
        break;

      // Operators (wait for next key)
      case 'd':
      case 'c':
        this.pending = key;
        break;

      default:
        // Ignore unbound keys in normal mode
        break;
    }

    return true;
  }

  handleOperator(op, motion, pos, val) {
    // Handle text objects: "iw" (inner word)
    if (motion === 'i') {
      this.pending = op + 'i'; // e.g. "di" or "ci"
      return;
    }

    let start = pos;
    let end = pos;

    switch (motion) {
      case 'd': // dd — clear line
      case 'c': // cc — clear line + insert
        this.input.value = '';
        if (op === 'c') this.setMode('insert');
        return;
      case 'w':
        end = this.nextWord(val, pos);
        break;
      case 'b':
        start = this.prevWord(val, pos);
        break;
      case 'e':
        end = this.endOfWord(val, pos) + 1;
        break;
      case '$':
        end = val.length;
        break;
      case '0':
        start = 0;
        break;
      default:
        return; // unknown motion, ignore
    }

    this.input.value = val.substring(0, start) + val.substring(end);
    this.setCursor(start);

    if (op === 'c') {
      this.setMode('insert');
    }
  }

  handleTextObject(op, obj, pos, val) {
    if (obj !== 'w') return; // only "iw" supported

    // Find inner word boundaries around cursor
    let start = pos;
    let end = pos;

    if (/\s/.test(val[pos] || '')) {
      // Cursor on whitespace: select the whitespace run
      while (start > 0 && /\s/.test(val[start - 1])) start--;
      while (end < val.length && /\s/.test(val[end])) end++;
    } else {
      // Cursor on a word: select the word
      while (start > 0 && !/\s/.test(val[start - 1])) start--;
      while (end < val.length && !/\s/.test(val[end])) end++;
    }

    this.input.value = val.substring(0, start) + val.substring(end);
    this.setCursor(Math.min(start, this.input.value.length));

    if (op === 'c') {
      this.setMode('insert');
    }
  }

  setCursor(pos) {
    this.input.setSelectionRange(pos, pos);
  }

  nextWord(str, pos) {
    // Skip current word chars, then skip spaces
    let i = pos;
    while (i < str.length && !/\s/.test(str[i])) i++;
    while (i < str.length && /\s/.test(str[i])) i++;
    return i;
  }

  prevWord(str, pos) {
    let i = pos;
    // Skip spaces before cursor
    while (i > 0 && /\s/.test(str[i - 1])) i--;
    // Skip word chars
    while (i > 0 && !/\s/.test(str[i - 1])) i--;
    return i;
  }

  endOfWord(str, pos) {
    let i = pos + 1;
    // Skip spaces
    while (i < str.length && /\s/.test(str[i])) i++;
    // Skip word chars
    while (i < str.length && !/\s/.test(str[i])) i++;
    return Math.max(i - 1, pos);
  }
}
