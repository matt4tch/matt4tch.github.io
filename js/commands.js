export const commands = {
  welcome(args) {
    return [
      'Welcome to the terminal portfolio.',
      '',
      "Type 'help' to get started.",
    ].join('<br>');
  },

  help(args) {
    return 'Commands: welcome, help, about, projects, education, resume, socials, clear';
  },
};
