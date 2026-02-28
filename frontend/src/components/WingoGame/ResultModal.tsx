import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WingoRound, WingoBet, Variant_red_green_violet } from '../../backend';
import { Trophy, TrendingDown } from 'lucide-react';

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  round: WingoRound | null;
  playerBets: WingoBet[];
}

function getColorLabel(color: Variant_red_green_violet): string {
  switch (color) {
    case Variant_red_green_violet.red: return 'Red';
    case Variant_red_green_violet.green: return 'Green';
    case Variant_red_green_violet.violet: return 'Violet';
  }
}

function getBetLabel(bet: WingoBet): string {
  if (bet.betType.__kind__ === 'numberValue') {
    return `Number ${bet.betType.numberValue.value}`;
  }
  if (bet.betType.__kind__ === 'violet') return 'Violet';
  return bet.betType.color.color === 'red' ? 'Red' : 'Green';
}

function didBetWin(bet: WingoBet, round: WingoRound): boolean {
  if (round.winningNumber === undefined || round.colorResult === undefined) return false;
  const winNum = Number(round.winningNumber);
  const winColor = round.colorResult;

  if (bet.betType.__kind__ === 'numberValue') {
    return Number(bet.betType.numberValue.value) === winNum;
  }
  if (bet.betType.__kind__ === 'violet') {
    return winColor === Variant_red_green_violet.violet;
  }
  if (bet.betType.__kind__ === 'color') {
    const betColor = bet.betType.color.color;
    return (betColor === 'red' && winColor === Variant_red_green_violet.red) ||
           (betColor === 'green' && winColor === Variant_red_green_violet.green);
  }
  return false;
}

function getPayout(bet: WingoBet, won: boolean): number {
  if (!won) return 0;
  const amount = Number(bet.amount);
  if (bet.betType.__kind__ === 'numberValue') return amount * 9;
  if (bet.betType.__kind__ === 'violet') return Math.floor(amount * 4.5);
  return amount * 2;
}

const colorStyles = {
  [Variant_red_green_violet.red]: {
    bg: 'oklch(0.62 0.28 25 / 0.15)',
    border: 'oklch(0.62 0.28 25 / 0.5)',
    text: 'oklch(0.85 0.22 25)',
    glow: '0 0 30px oklch(0.62 0.28 25 / 0.4)',
  },
  [Variant_red_green_violet.green]: {
    bg: 'oklch(0.72 0.25 145 / 0.15)',
    border: 'oklch(0.72 0.25 145 / 0.5)',
    text: 'oklch(0.85 0.22 145)',
    glow: '0 0 30px oklch(0.72 0.25 145 / 0.4)',
  },
  [Variant_red_green_violet.violet]: {
    bg: 'oklch(0.6 0.28 310 / 0.15)',
    border: 'oklch(0.6 0.28 310 / 0.5)',
    text: 'oklch(0.82 0.22 310)',
    glow: '0 0 30px oklch(0.6 0.28 310 / 0.4)',
  },
};

export default function ResultModal({ open, onClose, round, playerBets }: ResultModalProps) {
  if (!round || round.winningNumber === undefined || round.colorResult === undefined) return null;

  const winNum = Number(round.winningNumber);
  const winColor = round.colorResult;
  const styles = colorStyles[winColor];

  const roundBets = playerBets.filter((b) => b.roundId === round.id);
  const totalWon = roundBets.reduce((sum, bet) => {
    const won = didBetWin(bet, round);
    return sum + getPayout(bet, won);
  }, 0);
  const totalBet = roundBets.reduce((sum, bet) => sum + Number(bet.amount), 0);
  const netResult = totalWon - totalBet;
  const hasWon = netResult > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-sm border-0"
        style={{
          background: 'oklch(0.16 0.015 260)',
          border: `1px solid ${styles.border}`,
          boxShadow: styles.glow,
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-game text-center text-lg tracking-wider" style={{ color: 'oklch(0.82 0.18 85)' }}>
            Round #{String(round.id)} Result
          </DialogTitle>
        </DialogHeader>

        {/* Winning Number Display */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div
            className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center"
            style={{
              background: styles.bg,
              border: `2px solid ${styles.border}`,
              boxShadow: styles.glow,
            }}
          >
            <span className="font-game text-5xl font-bold" style={{ color: styles.text }}>
              {winNum}
            </span>
            <span className="font-body text-xs font-semibold mt-1" style={{ color: styles.text, opacity: 0.8 }}>
              {getColorLabel(winColor)}
            </span>
          </div>

          {/* Player Result */}
          {roundBets.length > 0 ? (
            <div
              className="w-full rounded-xl p-4 text-center"
              style={{
                background: hasWon ? 'oklch(0.72 0.25 145 / 0.1)' : 'oklch(0.62 0.28 25 / 0.1)',
                border: `1px solid ${hasWon ? 'oklch(0.72 0.25 145 / 0.4)' : 'oklch(0.62 0.28 25 / 0.4)'}`,
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {hasWon ? (
                  <Trophy className="w-5 h-5" style={{ color: 'oklch(0.82 0.18 85)' }} />
                ) : (
                  <TrendingDown className="w-5 h-5" style={{ color: 'oklch(0.62 0.28 25)' }} />
                )}
                <span
                  className="font-game text-base font-bold"
                  style={{ color: hasWon ? 'oklch(0.82 0.18 85)' : 'oklch(0.85 0.22 25)' }}
                >
                  {hasWon ? 'You Won!' : 'Better Luck Next Time'}
                </span>
              </div>
              {roundBets.map((bet, i) => {
                const won = didBetWin(bet, round);
                const payout = getPayout(bet, won);
                return (
                  <div key={i} className="flex justify-between items-center text-sm font-body mt-1">
                    <span style={{ color: 'oklch(0.6 0.02 260)' }}>{getBetLabel(bet)}</span>
                    <span style={{ color: won ? 'oklch(0.72 0.25 145)' : 'oklch(0.62 0.28 25)' }}>
                      {won ? `+${payout}` : `-${bet.amount}`}
                    </span>
                  </div>
                );
              })}
              {roundBets.length > 1 && (
                <div
                  className="flex justify-between items-center text-sm font-body mt-2 pt-2"
                  style={{ borderTop: '1px solid oklch(0.28 0.02 260)' }}
                >
                  <span className="font-semibold" style={{ color: 'oklch(0.7 0.02 260)' }}>Net</span>
                  <span
                    className="font-game font-bold"
                    style={{ color: netResult >= 0 ? 'oklch(0.72 0.25 145)' : 'oklch(0.62 0.28 25)' }}
                  >
                    {netResult >= 0 ? `+${netResult}` : netResult}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="font-body text-sm text-center" style={{ color: 'oklch(0.5 0.02 260)' }}>
              You didn't place any bets this round
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-game text-sm font-bold tracking-wider transition-all duration-200"
          style={{
            background: 'oklch(0.22 0.02 260)',
            border: '1px solid oklch(0.28 0.02 260)',
            color: 'oklch(0.7 0.02 260)',
          }}
        >
          Continue
        </button>
      </DialogContent>
    </Dialog>
  );
}
