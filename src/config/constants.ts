/**
 * Глобальные константы фронтенда.
 * Меняй тут — поведение всего приложения подстроится.
 */
export const PAGE_SIZE = 5000; // сколько свечей грузим за один "лист" (lazy-left)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const DEFAULT_INCLUDE_PARTIAL_LATEST = true; // показывать "живую" свечу в ответе (не в БД)
export const STALE_TIME_MS = 30_000; // react-query: когда данные считаем свежими
export const GC_TIME_MS = 5 * 60_000; // react-query: когда кэш можно чистить
export const LOG_VERBOSE = true;
