import { spawn } from 'node:child_process';

const blockList = new Set(['--host', '-h']);

const shouldDrop = (arg) => {
  if (blockList.has(arg)) {
    return true;
  }

  if (arg.startsWith('--host=')) {
    return true;
  }

  return false;
};

const passthroughArgs = process.argv.slice(2).filter((arg) => !shouldDrop(arg));

const child = spawn('pnpm', ['build', '--watch', ...passthroughArgs], {
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
