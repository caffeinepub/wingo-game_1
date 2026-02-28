import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type WingoRound, type WingoBet, type WingoBetType, type UserProfile } from '../backend';

export function useGetCurrentRound() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WingoRound>({
    queryKey: ['currentRound'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCurrentRound();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 3000,
  });
}

export function useGetRoundHistory(limit: number = 10) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WingoRound[]>({
    queryKey: ['roundHistory', limit],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRoundHistory(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetBetHistory(limit: number = 50) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WingoBet[]>({
    queryKey: ['betHistory', limit],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBetHistory(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function usePlaceBet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roundId,
      betType,
      amount,
    }: {
      roundId: bigint;
      betType: WingoBetType;
      amount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeBet(roundId, betType, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betHistory'] });
      queryClient.invalidateQueries({ queryKey: ['currentRound'] });
    },
  });
}
