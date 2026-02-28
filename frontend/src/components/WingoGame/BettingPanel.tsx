import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlaceBet } from '../../hooks/useQueries';
import { WingoBetType, Variant_red_green, WingoRound } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BettingPanelProps {
  currentRound: WingoRound;
  onBetPlaced?: () => void;
}

type BetSelection =
  | { kind: 'number'; value: number }
  | { kind: 'color'; color: 'red' | 'green' | 'violet' };

const QUICK_AMOUNTS = [10, 50, 100, 500];

const numberColors: Record<number, 'red' | 'green' | 'violet'> = {
  0: 'violet', 1: 'red', 2: 'green', 3: 'red', 4: 'green',
  5: 'violet', 6: 'green', 7: 'red', 8: 'green', 9: 'red',
};

export default function BettingPanel({ currentRound, onBetPlaced }: BettingPanelProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [selection, setSelection] = useState<BetSelection | null>(null);
  const [amount, setAmount] = useState<string>('10');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const placeBet = usePlaceBet();

  const isRoundOpen = Number(currentRound.endTime) > Date.now() * 1_000_000;

  const handlePlaceBet = async () => {
    if (!selection) {
      setFeedback({ type: 'error', message: 'Please select a number or color' });
      return;
    }
    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum < 1) {
      setFeedback({ type: 'error', message: 'Amount must be at least 1' });
      return;
    }

    let betType: WingoBetType;
    if (selection.kind === 'number') {
      betType = { __kind__: 'numberValue', numberValue: { value: BigInt(selection.value) } };
    } else if (selection.color === 'violet') {
      betType = { __kind__: 'violet', violet: null };
    } else {
      betType = {
        __kind__: 'color',
        color: {
          color: selection.color === 'red' ? Variant_red_green.red : Variant_red_green.green,
        },
      };
    }

    try {
      await placeBet.mutateAsync({
        roundId: currentRound.id,
        betType,
        amount: BigInt(amountNum),
      });
      setFeedback({ type: 'success', message: `Bet placed! ${amountNum} on ${getSelectionLabel(selection)}` });
      setSelection(null);
      onBetPlaced?.();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place bet';
      setFeedback({ type: 'error', message: msg });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const getSelectionLabel = (sel: BetSelection): string => {
    if (sel.kind === 'number') return `Number ${sel.value}`;
    return sel.color.charAt(0).toUpperCase() + sel.color.slice(1);
  };

  const isSelected = (sel: BetSelection): boolean => {
    if (!selection) return false;
    if (sel.kind === 'number' && selection.kind === 'number') return sel.value === selection.value;
    if (sel.kind === 'color' && selection.kind === 'color') return sel.color === selection.color;
    return false;
  };

  if (!isAuthenticated) {
    return (
      <div className="card-neon rounded-xl p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <AlertCircle className="w-8 h-8" style={{ color: 'oklch(0.82 0.18 85)' }} />
        <p className="font-body text-base font-semibold text-center" style={{ color: 'oklch(0.7 0.02 260)' }}>
          Login to place bets
        </p>
      </div>
    );
  }

  return (
    <div className="card-neon rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-game text-sm font-semibold tracking-wider" style={{ color: 'oklch(0.82 0.18 85)' }}>
          Place Your Bet
        </h3>
        {!isRoundOpen && (
          <span
            className="font-body text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'oklch(0.62 0.28 25 / 0.15)',
              border: '1px solid oklch(0.62 0.28 25 / 0.4)',
              color: 'oklch(0.85 0.22 25)',
            }}
          >
            Round Closed
          </span>
        )}
      </div>

      {/* Number Selection */}
      <div>
        <Label className="font-body text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'oklch(0.5 0.02 260)' }}>
          Pick a Number
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => {
            const color = numberColors[i];
            const sel: BetSelection = { kind: 'number', value: i };
            const selected = isSelected(sel);
            return (
              <button
                key={i}
                onClick={() => setSelection(sel)}
                disabled={!isRoundOpen}
                className={`number-btn-${color} ${selected ? 'selected' : ''} rounded-lg py-2.5 font-game font-bold text-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {i}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <Label className="font-body text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'oklch(0.5 0.02 260)' }}>
          Pick a Color
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {(['red', 'green', 'violet'] as const).map((color) => {
            const sel: BetSelection = { kind: 'color', color };
            const selected = isSelected(sel);
            const payoutLabel = color === 'violet' ? '4.5×' : '2×';
            return (
              <button
                key={color}
                onClick={() => setSelection(sel)}
                disabled={!isRoundOpen}
                className={`number-btn-${color} ${selected ? 'selected' : ''} rounded-lg py-3 font-body font-bold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5`}
              >
                <span className="capitalize">{color}</span>
                <span className="text-xs opacity-70">{payoutLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount */}
      <div>
        <Label className="font-body text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'oklch(0.5 0.02 260)' }}>
          Bet Amount
        </Label>
        <div className="flex gap-2 mb-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(String(amt))}
              className="flex-1 py-1.5 rounded-md font-body text-xs font-semibold transition-all duration-150"
              style={{
                background: amount === String(amt) ? 'oklch(0.82 0.18 85 / 0.2)' : 'oklch(0.2 0.01 260)',
                border: `1px solid ${amount === String(amt) ? 'oklch(0.82 0.18 85 / 0.6)' : 'oklch(0.28 0.02 260)'}`,
                color: amount === String(amt) ? 'oklch(0.82 0.18 85)' : 'oklch(0.6 0.02 260)',
              }}
            >
              {amt}
            </button>
          ))}
        </div>
        <Input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount..."
          className="font-game text-base"
          style={{
            background: 'oklch(0.12 0.01 260)',
            border: '1px solid oklch(0.28 0.02 260)',
            color: 'oklch(0.95 0.02 260)',
          }}
        />
      </div>

      {/* Selected Summary */}
      {selection && (
        <div
          className="rounded-lg px-3 py-2 flex items-center justify-between"
          style={{
            background: 'oklch(0.82 0.18 85 / 0.08)',
            border: '1px solid oklch(0.82 0.18 85 / 0.3)',
          }}
        >
          <span className="font-body text-sm" style={{ color: 'oklch(0.7 0.02 260)' }}>
            Betting on:
          </span>
          <span className="font-game text-sm font-bold" style={{ color: 'oklch(0.82 0.18 85)' }}>
            {getSelectionLabel(selection)} — {amount || '0'} pts
          </span>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2"
          style={{
            background: feedback.type === 'success' ? 'oklch(0.72 0.25 145 / 0.1)' : 'oklch(0.62 0.28 25 / 0.1)',
            border: `1px solid ${feedback.type === 'success' ? 'oklch(0.72 0.25 145 / 0.4)' : 'oklch(0.62 0.28 25 / 0.4)'}`,
          }}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.72 0.25 145)' }} />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'oklch(0.62 0.28 25)' }} />
          )}
          <span
            className="font-body text-sm"
            style={{ color: feedback.type === 'success' ? 'oklch(0.85 0.2 145)' : 'oklch(0.85 0.2 25)' }}
          >
            {feedback.message}
          </span>
        </div>
      )}

      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={placeBet.isPending || !isRoundOpen || !selection}
        className="w-full py-3.5 rounded-xl font-game text-sm font-bold tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, oklch(0.72 0.25 145 / 0.8), oklch(0.6 0.28 310 / 0.8))',
          border: '1px solid oklch(0.72 0.25 145 / 0.5)',
          color: 'oklch(0.98 0 0)',
          boxShadow: selection && isRoundOpen ? '0 0 20px oklch(0.72 0.25 145 / 0.3)' : 'none',
        }}
      >
        {placeBet.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Placing Bet...
          </span>
        ) : (
          'Place Bet'
        )}
      </button>

      {/* Payout Info */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: 'Number', payout: '9×', color: 'oklch(0.82 0.18 85)' },
          { label: 'Color', payout: '2×', color: 'oklch(0.72 0.25 145)' },
          { label: 'Violet', payout: '4.5×', color: 'oklch(0.82 0.2 310)' },
        ].map(({ label, payout, color }) => (
          <div
            key={label}
            className="rounded-lg p-2 text-center"
            style={{ background: 'oklch(0.14 0.01 260)', border: '1px solid oklch(0.22 0.015 260)' }}
          >
            <div className="font-body text-xs" style={{ color: 'oklch(0.5 0.02 260)' }}>{label}</div>
            <div className="font-game text-sm font-bold" style={{ color }}>{payout}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
