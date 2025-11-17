import React, { useMemo } from 'react';

interface TimerProps {
  startDate: string;
  endDate: string;
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

const Timer: React.FC<TimerProps> = ({ startDate, endDate, isCompleted, now }) => {
  const display = useMemo(() => {
    if (isCompleted) {
      return { text: 'Completed', color: 'bg-green-500/20 text-green-300' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const nowTime = now.getTime();

    if (nowTime < start.getTime()) {
      const diff = start.getTime() - nowTime;
      return { text: `Starts in ${formatDuration(diff)}`, color: 'bg-blue-500/20 text-blue-300' };
    } else if (nowTime <= end.getTime()) {
      const diff = end.getTime() - nowTime;
      return { text: `Ends in ${formatDuration(diff)}`, color: 'bg-yellow-500/20 text-yellow-300' };
    } else {
      const diff = nowTime - end.getTime();
      return { text: `Late by ${formatDuration(diff)}`, color: 'bg-red-500/20 text-red-300' };
    }
  }, [startDate, endDate, isCompleted, now]);

  return (
    <div className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${display.color}`}>
      {display.text}
    </div>
  );
};

export default Timer;