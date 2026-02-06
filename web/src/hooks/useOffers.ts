import { useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { PERSONHOOD_LENDING_ABI, PERSONHOOD_LENDING_ADDRESS } from '../abi/PersonhoodLending';
import type { Offer } from '../types';

const CONTRACT_CONFIG = {
  address: PERSONHOOD_LENDING_ADDRESS as `0x${string}`,
  abi: PERSONHOOD_LENDING_ABI,
};

export function useOffers() {
  const { address } = useAccount();
  
  const { writeContractAsync, isPending, error, isSuccess } = useWriteContract();

  const createOffer = useCallback(async (
    usageContext: string,
    weeklyPayment: bigint,
    deposit: bigint
  ) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'createOffer',
      args: [usageContext, weeklyPayment, deposit],
    });
  }, [writeContractAsync]);

  const updateOfferTerms = useCallback(async (
    offerId: bigint,
    newWeeklyPayment: bigint
  ) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'updateOfferTerms',
      args: [offerId, newWeeklyPayment],
    });
  }, [writeContractAsync]);

  const removeExpiredOffer = useCallback(async (offerId: bigint) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'removeExpiredOffer',
      args: [offerId],
    });
  }, [writeContractAsync]);

  const getAllOffers = useCallback(async (): Promise<Offer[]> => {
    return [];
  }, []);

  const getMyOffers = useCallback(async (): Promise<Offer[]> => {
    if (!address) return [];
    return [];
  }, [address]);

  return {
    createOffer,
    isCreating: isPending,
    createError: error,
    isCreateSuccess: isSuccess,
    updateOfferTerms,
    isUpdating: isPending,
    removeExpiredOffer,
    isRemoving: isPending,
    getAllOffers,
    getMyOffers,
  };
}
