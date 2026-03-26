const fs   = require('fs');
const path = require('path');
const os   = require('os');

const LOG_DIR = path.join(os.homedir(), '.logs', 'macropad');

// Create log directory if it doesn't exist
fs.mkdirSync(LOG_DIR, { recursive: true });

// Timestamped filename for this run
function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

const logFile = path.join(LOG_DIR, `${timestamp()}.log`);
const stream  = fs.createWriteStream(logFile, { flags: 'a' });

function write(line) {
  stream.write(line + '\n');
}

// Patch console.log and console.error to mirror to file
const _log   = console.log.bind(console);
const _error = console.error.bind(console);

console.log = (...args) => {
  const line = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
  _log(...args);
  write(line);
};

console.error = (...args) => {
  const line = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
  _error(...args);
  write('[ERROR] ' + line);
};

console.log(`[MacroPad] Log file: ${logFile}`);
