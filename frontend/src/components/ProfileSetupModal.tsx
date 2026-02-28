import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, User } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name');
      return;
    }
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    try {
      await saveProfile.mutateAsync({ name: trimmed });
    } catch {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="border-0 max-w-md"
        style={{
          background: 'oklch(0.16 0.015 260)',
          border: '1px solid oklch(0.6 0.28 310 / 0.4)',
          boxShadow: '0 0 40px oklch(0.6 0.28 310 / 0.2)',
        }}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'oklch(0.6 0.28 310 / 0.15)',
                border: '2px solid oklch(0.6 0.28 310 / 0.5)',
                boxShadow: '0 0 20px oklch(0.6 0.28 310 / 0.3)',
              }}
            >
              <User className="w-8 h-8" style={{ color: 'oklch(0.82 0.2 310)' }} />
            </div>
          </div>
          <DialogTitle className="font-game text-center text-xl text-glow-violet" style={{ color: 'oklch(0.82 0.2 310)' }}>
            Welcome to Wingo!
          </DialogTitle>
          <DialogDescription className="text-center font-body" style={{ color: 'oklch(0.6 0.03 260)' }}>
            Set up your player profile to start playing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-body font-semibold" style={{ color: 'oklch(0.8 0.02 260)' }}>
              Player Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={30}
              className="font-body text-base"
              style={{
                background: 'oklch(0.12 0.01 260)',
                border: '1px solid oklch(0.28 0.02 260)',
                color: 'oklch(0.95 0.02 260)',
              }}
            />
            {error && (
              <p className="text-sm font-body" style={{ color: 'oklch(0.62 0.28 25)' }}>
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={saveProfile.isPending}
            className="w-full font-game text-sm tracking-wider"
            style={{
              background: 'oklch(0.6 0.28 310 / 0.8)',
              border: '1px solid oklch(0.6 0.28 310)',
              color: 'oklch(0.98 0 0)',
              boxShadow: '0 0 16px oklch(0.6 0.28 310 / 0.4)',
            }}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Start Playing'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
