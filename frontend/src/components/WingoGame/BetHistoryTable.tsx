import React from 'react';
import { useGetBetHistory } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { WingoBet, Variant_red_green_violet } from '../../backend';
import { ClipboardList, TrendingUp, TrendingDown } from 'lucide-react';

function getBetLabel(bet: WingoBet): string {
  if (bet.betType.__kind__ === 'numberValue') return `#${bet.betType.numberValue.value}`;
  if (bet.betType.__kind__ === 'violet') return 'Violet';
  return bet.betType.color.color === 'red' ? 'Red' : 'Green';
}

function getBetColor(bet: WingoBet): string {
  if (bet.betType.__kind__ === 'numberValue') return 'oklch(0.82 0.18 85)';
  if (bet.betType.__kind__ === 'violet') return 'oklch(0.82 0.2 310)';
  return bet.betType.color.color === 'red' ? 'oklch(0.85 0.22 25)' : 'oklch(0.85 0.22 145)';
}

function getResultInfo(bet: WingoBet): { label: string; color: string; payout: number } | null {
  if (!bet.roundResult) return null;
  const { winningNumber, colorResult } = bet.roundResult;
  const winNum = Number(winningNumber);

  let won = false;
  let payout = 0;
  const amount = Number(bet.amount);

  if (bet.betType.__kind__ === 'numberValue') {
    won = Number(bet.betType.numberValue.value) === winNum;
    payout = won ? amount * 9 : 0;
  } else if (bet.betType.__kind__ === 'violet') {
    won = colorResult === Variant_red_green_violet.violet;
    payout = won ? Math.floor(amount * 4.5) : 0;
  } else {
    const betColor = bet.betType.color.color;
    won = (betColor === 'red' && colorResult === Variant_red_green_violet.red) ||
          (betColor === 'green' && colorResult === Variant_red_green_violet.green);
    payout = won ? amount * 2 : 0;
  }

  return {
    label: won ? `+${payout}` : `-${amount}`,
    color: won ? 'oklch(0.72 0.25 145)' : 'oklch(0.62 0.28 25)',
    payout,
  };
}

export default function BetHistoryTable() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: bets, isLoading } = useGetBetHistory(50);

  if (!isAuthenticated) {
    return (
      <div className="card-neon rounded-xl p-6 flex flex-col items-center justify-center gap-3 min-h-[150px]">
        <ClipboardList className="w-8 h-8" style={{ color: 'oklch(0.4 0.02 260)' }} />
        <p className="font-body text-sm" style={{ color: 'oklch(0.4 0.02 260)' }}>
          Login to view your bet history
        </p>
      </div>
    );
  }

  return (
    <div className="card-neon rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-game-border">
        <ClipboardList className="w-4 h-4" style={{ color: 'oklch(0.82 0.18 85)' }} />
        <h3 className="font-game text-sm font-semibold tracking-wider" style={{ color: 'oklch(0.82 0.18 85)' }}>
          Bet History
        </h3>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" style={{ background: 'oklch(0.2 0.01 260)' }} />
          ))}
        </div>
      ) : !bets || bets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10">
          <ClipboardList className="w-10 h-10" style={{ color: 'oklch(0.3 0.01 260)' }} />
          <p className="font-body text-sm" style={{ color: 'oklch(0.4 0.02 260)' }}>
            No bets placed yet
          </p>
        </div>
      ) : (
        <ScrollArea className="h-64">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: 'oklch(0.22 0.015 260)' }}>
                {['Round', 'Selection', 'Amount', 'Result'].map((h) => (
                  <TableHead
                    key={h}
                    className="font-game text-xs tracking-wider"
                    style={{ color: 'oklch(0.5 0.02 260)' }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...bets].reverse().map((bet, i) => {
                const result = getResultInfo(bet);
                return (
                  <TableRow
                    key={i}
                    style={{ borderColor: 'oklch(0.2 0.01 260)' }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="font-game text-xs" style={{ color: 'oklch(0.6 0.02 260)' }}>
                      #{String(bet.roundId)}
                    </TableCell>
                    <TableCell>
                      <span
                        className="font-body text-sm font-semibold px-2 py-0.5 rounded"
                        style={{
                          background: `${getBetColor(bet)}20`,
                          color: getBetColor(bet),
                          border: `1px solid ${getBetColor(bet)}40`,
                        }}
                      >
                        {getBetLabel(bet)}
                      </span>
                    </TableCell>
                    <TableCell className="font-game text-sm" style={{ color: 'oklch(0.7 0.02 260)' }}>
                      {String(bet.amount)}
                    </TableCell>
                    <TableCell>
                      {result ? (
                        <span
                          className="font-game text-sm font-bold flex items-center gap-1"
                          style={{ color: result.color }}
                        >
                          {result.payout > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {result.label}
                        </span>
                      ) : (
                        <span className="font-body text-xs" style={{ color: 'oklch(0.4 0.02 260)' }}>
                          Pending
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}
