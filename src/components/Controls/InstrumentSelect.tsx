/**
 * Комбинированный селектор "exchange • marketType • symbol" (dropdown).
 *
 * Что делает:
 * 1) Загружает символы по (exchange, marketType).
 * 2) Устраняет дубликаты и «битые» строки.
 * 3) Если текущего выбора нет — мягко выбирает первый валидный.
 * 4) Корректно ведёт себя при пустом списке (плейсхолдер, без «заблокированного» селекта).
 */

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSymbols, type SymbolRow } from '@/api/meta';
import { useSelection, type MarketType } from '@/state/selectionStore';
import { dlog } from '@/utils/devlog';

const InstrumentSelect: React.FC = () => {
  // 1) текущее состояние выбора и сеттеры
  const {
    exchange,
    marketType,
    symbol,
    setExchange,
    setMarketType,
    setSymbol,
  } = useSelection();

  // 2) грузим символы при наличии exchange+marketType
  const q = useQuery({
    queryKey: ['symbols', exchange, marketType],
    queryFn: () => fetchSymbols({ exchange, marketType }),
    enabled: Boolean(exchange && marketType),
    staleTime: 30_000,
  });

  // 3) нормализация + уникализация
  const symbols: SymbolRow[] = useMemo(() => {
    const raw = Array.isArray(q.data) ? q.data : [];
    const valid = raw.filter((s): s is SymbolRow =>
      Boolean(s?.exchange && s?.type && s?.name)
    );
    const seen = new Set<string>();
    const out: SymbolRow[] = [];
    for (const s of valid) {
      const k = `${s.exchange}|${s.type}|${s.name}`;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(s);
      }
    }
    dlog('ui/symbols', 'normalized', { count: out.length });
    return out;
  }, [q.data]);

  // 4) если текущего символа нет — выбрать первый валидный
  useEffect(() => {
    if (!symbols.length) return;
    const exists = symbols.some(
      (s) =>
        s.exchange === exchange && s.type === marketType && s.name === symbol
    );
    if (!exists) {
      const f = symbols[0];
      setExchange(f.exchange);
      setMarketType(f.type as MarketType);
      setSymbol(f.name);
    }
  }, [
    symbols,
    exchange,
    marketType,
    symbol,
    setExchange,
    setMarketType,
    setSymbol,
  ]);

  // 5) текущее value: плейсхолдер при пустом списке
  const value = symbols.length
    ? `${exchange}|${marketType}|${symbol}`
    : 'placeholder';

  // 6) обработчик выбора
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // (1) игнорируем плейсхолдер
    if (e.target.value === 'placeholder') return;
    // (2) распаковываем тройку
    const [ex, mt, sym] = e.target.value.split('|');
    // (3) пишем в стор
    setExchange(ex);
    setMarketType(mt as MarketType);
    setSymbol(sym);
  };

  // 7) рендер селекта с плейсхолдерами состояний
  return (
    <select
      className='bg-neutral-900 border border-neutral-700 rounded px-3 py-2 min-w-72 text-sm text-neutral-100'
      value={value}
      onChange={onChange}
      aria-label='Select instrument (exchange • marketType • symbol)'
    >
      {/* загрузка */}
      {q.isLoading && <option value='placeholder'>loading…</option>}

      {/* нормальные опции */}
      {!q.isLoading &&
        symbols.map((s) => {
          const key = s.id ? String(s.id) : `${s.exchange}|${s.type}|${s.name}`;
          const v = `${s.exchange}|${s.type}|${s.name}`;
          const label = `${s.exchange} • ${s.type} • ${s.name}`;
          return (
            <option key={key} value={v}>
              {label}
            </option>
          );
        })}

      {/* пусто */}
      {!q.isLoading && !symbols.length && (
        <option value='placeholder'>no symbols</option>
      )}
    </select>
  );
};

export default InstrumentSelect;
