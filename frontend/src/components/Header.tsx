import React from 'react';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { User } from 'lucide-react';

export default function Header() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  return (
    <header className="relative z-20 w-full border-b border-game-border bg-game-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/wingo-logo.dim_400x120.png"
              alt="Wingo Game"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <span
              className="font-game text-2xl font-bold text-glow-violet hidden"
              style={{ color: 'oklch(0.82 0.2 310)' }}
            >
              WINGO
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-game-border bg-game-bg/50">
                <User className="w-3.5 h-3.5" style={{ color: 'oklch(0.82 0.18 85)' }} />
                <span className="font-body text-sm font-semibold" style={{ color: 'oklch(0.82 0.18 85)' }}>
                  {userProfile.name}
                </span>
              </div>
            )}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
