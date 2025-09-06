/**
 * Простая утилита для dev-логов с единым стилем.
 * Использует группировки, легко вырубается флагом LOG_VERBOSE.
 */
import { LOG_VERBOSE } from '@/config/constants';

export function dlog(ns: string, msg: string, meta?: unknown) {
  if (!LOG_VERBOSE) return;
  // eslint-disable-next-line no-console
  console.debug(`[${ns}] ${msg}`, meta ?? '');
}

export function dgroup(
  ns: string,
  msg: string,
  meta?: unknown,
  fn?: () => void
) {
  if (!LOG_VERBOSE) return;
  // eslint-disable-next-line no-console
  console.groupCollapsed(`[${ns}] ${msg}`, meta ?? '');
  try {
    fn?.();
  } finally {
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
}
