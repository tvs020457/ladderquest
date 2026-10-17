import React from 'react';

interface StreakCalendarProps {
  activeDays: string[]; // YYYY-MM-DD
  currentDate?: string;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  activeDays,
  currentDate = new Date().toISOString().split('T')[0],
}) => {
  const [currY, currM] = currentDate.split('-').map(Number);
  const activeSet = new Set(activeDays);

  // Calculate days in month and starting day of week
  const daysInMonth = new Date(currY, currM, 0).getDate();
  const firstDayOfWeek = new Date(currY, currM - 1, 1).getDay(); // 0 is Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid var(--color-bg-tertiary)',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
          {monthNames[currM - 1]} {currY}
        </h4>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-2)' }}>
          🔥 {activeDays.length} Active Days
        </span>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <span key={i} style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>
            {day}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty_${i}`} style={{ height: '34px' }} />
        ))}

        {daysArray.map((day) => {
          const dayStr = `${currY}-${String(currM).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isActive = activeSet.has(dayStr);
          const isToday = dayStr === currentDate;

          return (
            <div
              key={day}
              style={{
                height: '34px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'var(--color-2)' : 'var(--color-bg-canvas)',
                color: isActive ? '#ffffff' : isToday ? 'var(--color-1)' : '#94a3b8',
                border: isToday ? '1.5px solid var(--color-1)' : '1px solid var(--color-bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.82rem',
                fontWeight: isActive || isToday ? 900 : 600,
              }}
            >
              {isActive ? '🔥' : day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
