import { useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { PERSONHOOD_LENDING_ABI, PERSONHOOD_LENDING_ADDRESS } from '../abi/PersonhoodLending';
import type { Offer, Dispute } from '../types';

const CONTRACT_CONFIG = {
  address: PERSONHOOD_LENDING_ADDRESS as `0x${string}`,
  abi: PERSONHOOD_LENDING_ABI,
};

export function useRentals() {
  const { address } = useAccount();
  const { writeContractAsync, isPending, error, isSuccess } = useWriteContract();

  const acceptOffer = useCallback(async (
    offerId: bigint,
    deposit: bigint,
    weeklyPayment: bigint
  ) => {
    const totalValue = deposit + weeklyPayment;
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'acceptOffer',
      args: [offerId],
      value: totalValue,
    });
  }, [writeContractAsync]);

  const renewRental = useCallback(async (
    offerId: bigint,
    weeklyPayment: bigint
  ) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'renewRental',
      args: [offerId],
      value: weeklyPayment,
    });
  }, [writeContractAsync]);

  const returnToMarket = useCallback(async (offerId: bigint) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'returnToMarket',
      args: [offerId],
    });
  }, [writeContractAsync]);

  const claimPayout = useCallback(async (offerId: bigint) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'claimPayout',
      args: [offerId],
    });
  }, [writeContractAsync]);

  const cancelRent = useCallback(async (offerId: bigint) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'cancelRent',
      args: [offerId],
    });
  }, [writeContractAsync]);

  const getMyRentals = useCallback(async (): Promise<Offer[]> => {
    if (!address) return [];
    return [];
  }, [address]);

  return {
    acceptOffer,
    isAccepting: isPending,
    acceptError: error,
    isAcceptSuccess: isSuccess,
    renewRental,
    isRenewing: isPending,
    returnToMarket,
    isReturning: isPending,
    claimPayout,
    isClaiming: isPending,
    cancelRent,
    isCancelling: isPending,
    getMyRentals,
  };
}

export function useActiveDispute() {
  return {
    dispute: undefined as Dispute | undefined,
    activeDisputeId: undefined as bigint | undefined,
    isLoading: false,
    error: null as Error | null,
    refetch: async () => {},
  };
}
