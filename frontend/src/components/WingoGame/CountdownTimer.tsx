import React, { useState, useEffect } from 'react';
import { WingoRound } from '../../backend';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  round: WingoRound;
}

function getTimeRemaining(endTime: bigint): number {
  const now = Date.now() * 1_000_000; // convert ms to ns
  const end = Number(endTime);
  const remaining = Math.max(0, Math.floor((end - now) / 1_000_000_000));
  return remaining;
}

export default function CountdownTimer({ round }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => getTimeRemaining(round.endTime));

  useEffect(() => {
    setTimeLeft(getTimeRemaining(round.endTime));
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(round.endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [round.endTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 10;
  const isExpired = timeLeft === 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2 mb-1">
        <Timer
          className="w-4 h-4"
          style={{ color: isUrgent ? 'oklch(0.62 0.28 25)' : 'oklch(0.6 0.03 260)' }}
        />
        <span
          className="font-body text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'oklch(0.6 0.03 260)' }}
        >
          {isExpired ? 'Round Ended' : 'Time Remaining'}
        </span>
      </div>

      <div
        className={`font-game text-5xl font-bold tabular-nums transition-all duration-300 ${
          isUrgent ? 'text-glow-red animate-neon-pulse' : 'text-glow-violet'
        }`}
        style={{
          color: isUrgent ? 'oklch(0.85 0.25 25)' : 'oklch(0.82 0.2 310)',
          letterSpacing: '0.05em',
        }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${isExpired ? 'bg-neon-red' : 'bg-neon-green animate-pulse'}`}
          style={{
            background: isExpired ? 'oklch(0.62 0.28 25)' : 'oklch(0.72 0.25 145)',
            boxShadow: isExpired
              ? '0 0 6px oklch(0.62 0.28 25)'
              : '0 0 6px oklch(0.72 0.25 145)',
          }}
        />
        <span
          className="font-body text-xs"
          style={{ color: 'oklch(0.5 0.02 260)' }}
        >
          Round #{String(round.id)}
        </span>
      </div>
    </div>
  );
}
