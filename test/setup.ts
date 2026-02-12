import { vi } from 'vitest';

const originalConsole = console;

global.console = {
  ...originalConsole,
  log: vi.fn(originalConsole.log),
  warn: vi.fn(originalConsole.warn),
  error: vi.fn(originalConsole.error)
};
