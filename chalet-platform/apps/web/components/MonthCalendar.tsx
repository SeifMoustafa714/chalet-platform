'use client';

import { useState } from 'react';

interface MonthCalendarProps {
  blockedDates: Set<string>;
  onDayClick?: (date: string) => void;
}

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function MonthCalendar({ blockedDates, onDayClick }: MonthCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); }
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); } else { setMonth(month + 1); }
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="text-ink/50 hover:text-ink">←</button>
        <p className="font-display text-sm font-medium text-ink">{monthLabel}</p>
        <button type="button" onClick={nextMonth} className="text-ink/50 hover:text-ink">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="py-1 text-ink/40">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = toDateKey(year, month, day);
          const isBlocked = blockedDates.has(key);
          return (
            <button
              type="button"
              key={i}
              disabled={!onDayClick}
              onClick={() => onDayClick?.(key)}
              className={`aspect-square rounded text-xs ${
                isBlocked
                  ? 'bg-bougainvillea/20 text-bougainvillea'
                  : 'bg-sand/50 text-ink/70 hover:bg-marina/10'
              } ${onDayClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-ink/50">
        <span><span className="inline-block h-2 w-2 rounded-full bg-bougainvillea/40 align-middle" /> unavailable</span>
        <span><span className="inline-block h-2 w-2 rounded-full bg-sand align-middle" /> available</span>
      </div>
    </div>
  );
}
