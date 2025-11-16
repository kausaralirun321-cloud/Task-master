
import React, { useMemo } from 'react';

interface TimerProps {
  dueDate: string;
  isCompleted: boolean;
  now: Date;
}

const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds >= 0) parts.push(`${seconds}s`);
  
  return parts.join(' ') || '0s';
};

const Timer: React.FC<TimerProps> = ({ dueDate, isCompleted, now }) => {
  const display = useMemo(() => {
    if (isCompleted) {
      return { text: 'Completed', color: 'text-green-400' };
    }

    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();

    if (diff > 0) {
      return { text: formatDuration(diff), color: 'text-yellow-400' };
    } else {
      return { text: `Late by ${formatDuration(-diff)}`, color: 'text-red-400' };
    }
  }, [dueDate, isCompleted, now]);

  return (
    <div className={`text-sm font-mono whitespace-nowrap ${display.color}`}>
      {display.text}
    </div>
  );
};

export default Timer;
