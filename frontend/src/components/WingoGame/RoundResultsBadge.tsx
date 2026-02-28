import React from 'react';
import { WingoRound, Variant_red_green_violet } from '../../backend';

interface RoundResultsBadgeProps {
  round: WingoRound;
  size?: 'sm' | 'md';
}

function getColorForNumber(num: number): 'red' | 'green' | 'violet' {
  if (num === 0 || num === 5) return 'violet';
  if ([1, 3, 7, 9].includes(num)) return 'red';
  return 'green';
}

const colorStyles = {
  red: {
    bg: 'oklch(0.62 0.28 25 / 0.2)',
    border: 'oklch(0.62 0.28 25 / 0.6)',
    text: 'oklch(0.85 0.22 25)',
    glow: '0 0 10px oklch(0.62 0.28 25 / 0.5)',
    label: 'R',
  },
  green: {
    bg: 'oklch(0.72 0.25 145 / 0.2)',
    border: 'oklch(0.72 0.25 145 / 0.6)',
    text: 'oklch(0.85 0.22 145)',
    glow: '0 0 10px oklch(0.72 0.25 145 / 0.5)',
    label: 'G',
  },
  violet: {
    bg: 'oklch(0.6 0.28 310 / 0.2)',
    border: 'oklch(0.6 0.28 310 / 0.6)',
    text: 'oklch(0.82 0.22 310)',
    glow: '0 0 10px oklch(0.6 0.28 310 / 0.5)',
    label: 'V',
  },
};

export default function RoundResultsBadge({ round, size = 'md' }: RoundResultsBadgeProps) {
  const winningNumber = round.winningNumber !== undefined ? Number(round.winningNumber) : null;
  const colorResult = round.colorResult;

  if (winningNumber === null || colorResult === undefined) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg"
        style={{
          width: size === 'sm' ? '40px' : '52px',
          height: size === 'sm' ? '48px' : '62px',
          background: 'oklch(0.2 0.01 260)',
          border: '1px solid oklch(0.28 0.02 260)',
        }}
      >
        <span className="font-game text-xs" style={{ color: 'oklch(0.4 0.02 260)' }}>?</span>
      </div>
    );
  }

  const color = colorResult === Variant_red_green_violet.violet
    ? 'violet'
    : colorResult === Variant_red_green_violet.red
    ? 'red'
    : 'green';

  const styles = colorStyles[color];

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg transition-all duration-200 hover:scale-105"
      style={{
        width: size === 'sm' ? '40px' : '52px',
        height: size === 'sm' ? '48px' : '62px',
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        boxShadow: styles.glow,
      }}
    >
      <span
        className="font-game font-bold leading-none"
        style={{
          fontSize: size === 'sm' ? '16px' : '20px',
          color: styles.text,
        }}
      >
        {winningNumber}
      </span>
      <span
        className="font-body font-semibold leading-none mt-0.5"
        style={{
          fontSize: size === 'sm' ? '9px' : '10px',
          color: styles.text,
          opacity: 0.8,
        }}
      >
        {styles.label}
      </span>
    </div>
  );
}
