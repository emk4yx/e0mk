export class Logger {
  // https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit

  #logMessage(type, color, ...args) {
    const options = { timeZone: 'Europe/Berlin' };
    const date = new Date().toLocaleString('de-DE', options);

    const coloredType = `\x1b[${color}m${type}\x1b[97m`;
    console.log(`\x1b[37m${date}\x1b[97m [${coloredType}]:`, ...args);
  }

  msg(...args) {
    this.#logMessage('LOG', '34', ...args);
  };

  info(...args) {
    this.#logMessage('INFO', '32', ...args);
  };

  warn(...args) {
    this.#logMessage('WARN', '33', ...args);
  };

  error(...args) {
    this.#logMessage('ERROR', '31', ...args);
  };

  conduit(...args) {
    this.#logMessage('CONDUIT', '95', ...args)
  }
}