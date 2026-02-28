import React from 'react';
import { useGetRoundHistory } from '../../hooks/useQueries';
import RoundResultsBadge from './RoundResultsBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';

export default function RoundHistory() {
  const { data: rounds, isLoading } = useGetRoundHistory(10);

  const resolvedRounds = rounds?.filter(
    (r) => r.winningNumber !== undefined && r.colorResult !== undefined
  ) ?? [];

  return (
    <div className="card-neon rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4" style={{ color: 'oklch(0.82 0.18 85)' }} />
        <h3 className="font-game text-sm font-semibold tracking-wider" style={{ color: 'oklch(0.82 0.18 85)' }}>
          Recent Results
        </h3>
      </div>

      {isLoading ? (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="rounded-lg"
              style={{ width: '52px', height: '62px', background: 'oklch(0.2 0.01 260)' }}
            />
          ))}
        </div>
      ) : resolvedRounds.length === 0 ? (
        <div className="flex items-center justify-center h-16">
          <p className="font-body text-sm" style={{ color: 'oklch(0.4 0.02 260)' }}>
            No results yet
          </p>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {[...resolvedRounds].reverse().map((round) => (
            <RoundResultsBadge key={String(round.id)} round={round} size="md" />
          ))}
        </div>
      )}
    </div>
  );
}
