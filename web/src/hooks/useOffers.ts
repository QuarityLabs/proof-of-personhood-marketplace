import { useCallback, useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { PERSONHOOD_LENDING_ABI, PERSONHOOD_LENDING_ADDRESS } from '../abi/PersonhoodLending';
import type { Offer } from '../types';

const CONTRACT_CONFIG = {
  address: PERSONHOOD_LENDING_ADDRESS as `0x${string}`,
  abi: PERSONHOOD_LENDING_ABI,
};

export function useOffers() {
  const { address } = useAccount();
  
  // Separate write contract hooks for each operation to track independent states
  const { writeContractAsync: createWrite, ...createMutation } = useWriteContract();
  const { writeContractAsync: updateWrite, ...updateMutation } = useWriteContract();
  const { writeContractAsync: removeWrite, ...removeMutation } = useWriteContract();

  const createOffer = useCallback(async (
    usageContext: string,
    weeklyPayment: bigint,
    deposit: bigint
  ) => {
    return createWrite({
      ...CONTRACT_CONFIG,
      functionName: 'createOffer',
      args: [usageContext, weeklyPayment, deposit],
    });
  }, [createWrite]);

  const updateOfferTerms = useCallback(async (
    offerId: bigint,
    newWeeklyPayment: bigint
  ) => {
    return updateWrite({
      ...CONTRACT_CONFIG,
      functionName: 'updateOfferTerms',
      args: [offerId, newWeeklyPayment],
    });
  }, [updateWrite]);

  const removeExpiredOffer = useCallback(async (offerId: bigint) => {
    return removeWrite({
      ...CONTRACT_CONFIG,
      functionName: 'removeExpiredOffer',
      args: [offerId],
    });
  }, [removeWrite]);

  const { data: nextOfferIdData, refetch: refetchNextOfferId } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'nextOfferId',
  });

  const nextOfferId = nextOfferIdData as bigint | undefined;

  const getAllOffers = useCallback(async (): Promise<Offer[]> => {
    if (!nextOfferId) return [];
    return [];
  }, [nextOfferId]);

  const getMyOffers = useCallback(async (): Promise<Offer[]> => {
    if (!address || !nextOfferId) return [];
    
    const allOffers = await getAllOffers();
    return allOffers.filter(offer => 
      offer.submitter.toLowerCase() === address.toLowerCase()
    );
  }, [address, nextOfferId, getAllOffers]);

  return {
    createOffer,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    isCreateSuccess: createMutation.isSuccess,
    updateOfferTerms,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    isUpdateSuccess: updateMutation.isSuccess,
    removeExpiredOffer,
    isRemoving: removeMutation.isPending,
    removeError: removeMutation.error,
    isRemoveSuccess: removeMutation.isSuccess,
    nextOfferId,
    refetchNextOfferId,
    getAllOffers,
    getMyOffers,
  };
}

export function useOffer(offerId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'offers',
    args: offerId !== undefined ? [offerId] : undefined,
    query: {
      enabled: offerId !== undefined,
    },
  });

  const typedData = data as readonly [
    bigint, `0x${string}`, `0x${string}`, string, bigint, bigint, bigint, bigint, bigint, bigint, number, bigint, number, number, bigint
  ] | undefined;

  const offer: Offer | undefined = typedData ? {
    offerId: typedData[0],
    submitter: typedData[1],
    renter: typedData[2],
    usageContext: typedData[3],
    weeklyPayment: typedData[4],
    deposit: typedData[5],
    lockedPayment: typedData[6],
    createdAt: typedData[7],
    rentedAt: typedData[8],
    expiresAt: typedData[9],
    status: typedData[10] as 0 | 1 | 2 | 3,
    totalRentals: typedData[11],
    lenderOffences: typedData[12],
    renterInvalidDisputes: typedData[13],
    activeDisputeId: typedData[14],
  } : undefined;

  return {
    offer,
    isLoading,
    error,
    refetch,
  };
}

export function useAllOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { data: nextOfferIdData } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'nextOfferId',
  });

  const nextOfferId = nextOfferIdData as bigint | undefined;

  const fetchAllOffers = useCallback(async () => {
    if (!nextOfferId) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedOffers: Offer[] = [];

      // TODO: Implement actual contract reads for each offer
      // This requires calling the contract for each offer ID (0 to Number(nextOfferId)-1)
      // Consider using wagmi's useReadContracts for batching or implementing a multicall pattern
      // For now, this returns an empty array as the hook structure is in place

      setOffers(fetchedOffers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch offers'));
    } finally {
      setIsLoading(false);
    }
  }, [nextOfferId]);

  useEffect(() => {
    fetchAllOffers();
  }, [fetchAllOffers]);

  return {
    offers,
    isLoading,
    error,
    refetch: fetchAllOffers,
    nextOfferId,
  };
}
