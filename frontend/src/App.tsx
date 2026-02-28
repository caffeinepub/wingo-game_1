import React from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import WingoLobby from './components/WingoGame/WingoLobby';
import ProfileSetupModal from './components/ProfileSetupModal';
import LoginButton from './components/LoginButton';
import { Loader2, Gamepad2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'oklch(0.12 0.01 260)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="w-10 h-10 animate-spin"
          style={{ color: 'oklch(0.6 0.28 310)' }}
        />
        <span className="font-game text-sm tracking-widest" style={{ color: 'oklch(0.5 0.02 260)' }}>
          Loading...
        </span>
      </div>
    </div>
  );
}

function LandingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-8 px-4"
      style={{
        backgroundImage: 'url(/assets/generated/game-bg.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'oklch(0.1 0.01 260 / 0.88)' }}
      />
      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-lg">
        <img
          src="/assets/generated/wingo-logo.dim_400x120.png"
          alt="Wingo Game"
          className="h-20 w-auto object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
          }}
        />
        <div>
          <h1
            className="font-game text-5xl font-black mb-3 text-glow-violet"
            style={{ color: 'oklch(0.82 0.2 310)' }}
          >
            WINGO
          </h1>
          <p className="font-body text-lg" style={{ color: 'oklch(0.6 0.02 260)' }}>
            Predict the number. Win big. Every 30 seconds.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <LoginButton />
          <p className="font-body text-xs" style={{ color: 'oklch(0.4 0.02 260)' }}>
            Login to start playing
          </p>
        </div>

        {/* Color legend */}
        <div className="flex gap-4">
          {[
            { color: 'oklch(0.85 0.22 25)', label: 'Red', nums: '1,3,7,9' },
            { color: 'oklch(0.85 0.22 145)', label: 'Green', nums: '2,4,6,8' },
            { color: 'oklch(0.82 0.22 310)', label: 'Violet', nums: '0,5' },
          ].map(({ color, label, nums }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-game text-xs font-bold"
                style={{
                  background: `${color}20`,
                  border: `1px solid ${color}60`,
                  color,
                }}
              >
                {label[0]}
              </div>
              <span className="font-body text-xs" style={{ color: 'oklch(0.5 0.02 260)' }}>
                {nums}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'oklch(0.12 0.01 260)' }}>
      <Header />

      <main className="flex-1">
        {!isAuthenticated ? (
          <LandingScreen />
        ) : profileLoading && !isFetched ? (
          <LoadingScreen />
        ) : (
          <WingoLobby />
        )}
      </main>

      <footer
        className="relative z-10 border-t py-4 px-6"
        style={{
          borderColor: 'oklch(0.22 0.015 260)',
          background: 'oklch(0.14 0.01 260)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body text-xs" style={{ color: 'oklch(0.4 0.02 260)' }}>
            © {new Date().getFullYear()} Wingo Game. All rights reserved.
          </p>
          <p className="font-body text-xs flex items-center gap-1" style={{ color: 'oklch(0.4 0.02 260)' }}>
            Built with{' '}
            <span style={{ color: 'oklch(0.62 0.28 25)' }}>♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'wingo-game')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors"
              style={{ color: 'oklch(0.6 0.28 310)' }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Profile Setup Modal */}
      <ProfileSetupModal open={showProfileSetup} />
    </div>
  );
}
