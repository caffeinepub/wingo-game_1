import React, { useState, useEffect, useRef } from 'react';
import { useGetCurrentRound, useGetBetHistory } from '../../hooks/useQueries';
import CountdownTimer from './CountdownTimer';
import RoundHistory from './RoundHistory';
import BettingPanel from './BettingPanel';
import BetHistoryTable from './BetHistoryTable';
import ResultModal from './ResultModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function WingoLobby() {
  const { data: currentRound, isLoading: roundLoading } = useGetCurrentRound();
  const { data: betHistory } = useGetBetHistory(50);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [showResultModal, setShowResultModal] = useState(false);
  const [resultRound, setResultRound] = useState<typeof currentRound | null>(null);
  const prevRoundIdRef = useRef<bigint | null>(null);

  // Detect round change to show result modal
  useEffect(() => {
    if (!currentRound) return;
    const prevId = prevRoundIdRef.current;
    if (prevId !== null && currentRound.id !== prevId) {
      setResultRound(currentRound);
      setShowResultModal(true);
    }
    prevRoundIdRef.current = currentRound.id;
  }, [currentRound?.id]);

  const playerBets = betHistory ?? [];

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/assets/generated/game-bg.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'oklch(0.1 0.01 260 / 0.85)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section: Timer + Round History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Timer Card */}
          <div
            className="lg:col-span-1 card-neon rounded-2xl p-6 flex flex-col items-center justify-center min-h-[180px]"
            style={{
              border: '1px solid oklch(0.6 0.28 310 / 0.3)',
              boxShadow: '0 0 30px oklch(0.6 0.28 310 / 0.1)',
            }}
          >
            {roundLoading || !currentRound ? (
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-4 w-24 rounded" style={{ background: 'oklch(0.2 0.01 260)' }} />
                <Skeleton className="h-14 w-40 rounded" style={{ background: 'oklch(0.2 0.01 260)' }} />
                <Skeleton className="h-3 w-20 rounded" style={{ background: 'oklch(0.2 0.01 260)' }} />
              </div>
            ) : (
              <CountdownTimer round={currentRound} />
            )}
          </div>

          {/* Round History */}
          <div className="lg:col-span-2">
            <RoundHistory />
          </div>
        </div>

        {/* Main Content: Betting Panel + Bet History */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Betting Panel */}
          <div className="lg:col-span-2">
            {roundLoading || !currentRound ? (
              <div className="card-neon rounded-xl p-5 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" style={{ background: 'oklch(0.2 0.01 260)' }} />
                ))}
              </div>
            ) : (
              <BettingPanel currentRound={currentRound} />
            )}
          </div>

          {/* Bet History */}
          <div className="lg:col-span-3">
            <BetHistoryTable />
          </div>
        </div>

        {/* How to Play */}
        <div className="mt-6 card-neon rounded-xl p-5">
          <h3 className="font-game text-sm font-semibold tracking-wider mb-3" style={{ color: 'oklch(0.82 0.18 85)' }}>
            How to Play
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: '1',
                title: 'Pick Your Bet',
                desc: 'Choose a number (0-9) or a color (Red/Green/Violet) before the timer runs out.',
                color: 'oklch(0.82 0.2 310)',
              },
              {
                step: '2',
                title: 'Set Amount',
                desc: 'Enter your bet amount. Numbers pay 9×, colors pay 2×, and Violet pays 4.5×.',
                color: 'oklch(0.72 0.25 145)',
              },
              {
                step: '3',
                title: 'Win Big!',
                desc: 'Wait for the round to resolve. Red: 1,3,7,9 · Green: 2,4,6,8 · Violet: 0,5',
                color: 'oklch(0.82 0.18 85)',
              },
            ].map(({ step, title, desc, color }) => (
              <div
                key={step}
                className="rounded-lg p-4"
                style={{ background: 'oklch(0.14 0.01 260)', border: '1px solid oklch(0.22 0.015 260)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="font-game text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: `${color}20`,
                      border: `1px solid ${color}60`,
                      color,
                    }}
                  >
                    {step}
                  </span>
                  <span className="font-body font-bold text-sm" style={{ color: 'oklch(0.85 0.02 260)' }}>
                    {title}
                  </span>
                </div>
                <p className="font-body text-xs leading-relaxed" style={{ color: 'oklch(0.5 0.02 260)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        round={resultRound ?? null}
        playerBets={playerBets}
      />
    </div>
  );
}
