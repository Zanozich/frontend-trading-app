/**
 * Единый axios-клиент с базовым таймаутом, унификацией ошибок и DEV-логами.
 */
import axios from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { dlog } from '@/utils/devlog';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12_000,
});

/** DEV: логируем запрос и помечаем время старта */
api.interceptors.request.use((config) => {
  (config as any)._startedAt = performance.now?.() ?? Date.now();
  dlog(
    'api',
    `→ ${String(config.method ?? 'get').toUpperCase()} ${config.url}`,
    {
      params: config.params,
    }
  );
  return config;
});

/** DEV: логируем ответ + тайминг; PROD: поведение не меняется */
api.interceptors.response.use(
  (resp) => {
    const started = (resp.config as any)._startedAt ?? Date.now();
    const ms = Math.round((performance.now?.() ?? Date.now()) - started);
    const url = resp.config.url ?? '';

    let rows: number | undefined;
    const d = resp.data;
    if (Array.isArray(d)) rows = d.length;
    else if (d?.candles && Array.isArray(d.candles)) rows = d.candles.length;
    else if (d?.rows && Array.isArray(d.rows)) rows = d.rows.length;

    dlog('api', `← ${resp.status} ${url} (${ms}ms)`, {
      rows,
      // аккуратно покажем «форму» (первый элемент либо сам объект)
      sample: Array.isArray(d) ? d[0] : d,
    });
    return resp;
  },
  (err) => {
    // 1) Достаём message от бэка если он есть
    err.message = err?.response?.data?.message ?? err.message;
    // 2) DEV-лог ошибки
    const url = err?.config?.url ?? '';
    dlog('api', `✖ ${url}`, {
      message: err?.message,
      response: err?.response?.data,
    });
    // 3) Пробрасываем наверх — react-query/вызвавший код покажет тост/ошибку
    return Promise.reject(err);
  }
);
