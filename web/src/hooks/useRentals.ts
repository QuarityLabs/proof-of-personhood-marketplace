import { useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { PERSONHOOD_LENDING_ABI, PERSONHOOD_LENDING_ADDRESS } from '../abi/PersonhoodLending';
import type { Offer, Dispute } from '../types';

const CONTRACT_CONFIG = {
  address: PERSONHOOD_LENDING_ADDRESS as `0x${string}`,
  abi: PERSONHOOD_LENDING_ABI,
};

export function useRentals() {
  const { address } = useAccount();
  
  // Separate write contract hooks for each operation
  const { writeContractAsync: acceptWrite, ...acceptMutation } = useWriteContract();
  const { writeContractAsync: renewWrite, ...renewMutation } = useWriteContract();
  const { writeContractAsync: returnWrite, ...returnMutation } = useWriteContract();
  const { writeContractAsync: claimWrite, ...claimMutation } = useWriteContract();
  const { writeContractAsync: cancelWrite, ...cancelMutation } = useWriteContract();

  const acceptOffer = useCallback(async (
    offerId: bigint,
    deposit: bigint,
    weeklyPayment: bigint
  ) => {
    const totalValue = deposit + weeklyPayment;
    return acceptWrite({
      ...CONTRACT_CONFIG,
      functionName: 'acceptOffer',
      args: [offerId],
      value: totalValue,
    });
  }, [acceptWrite]);

  const renewRental = useCallback(async (
    offerId: bigint,
    weeklyPayment: bigint
  ) => {
    return renewWrite({
      ...CONTRACT_CONFIG,
      functionName: 'renewRental',
      args: [offerId],
      value: weeklyPayment,
    });
  }, [renewWrite]);

  const returnToMarket = useCallback(async (offerId: bigint) => {
    return returnWrite({
      ...CONTRACT_CONFIG,
      functionName: 'returnToMarket',
      args: [offerId],
    });
  }, [returnWrite]);

  const claimPayout = useCallback(async (offerId: bigint) => {
    return claimWrite({
      ...CONTRACT_CONFIG,
      functionName: 'claimPayout',
      args: [offerId],
    });
  }, [claimWrite]);

  const cancelRent = useCallback(async (offerId: bigint) => {
    return cancelWrite({
      ...CONTRACT_CONFIG,
      functionName: 'cancelRent',
      args: [offerId],
    });
  }, [cancelWrite]);

  const { data: nextOfferIdData } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'nextOfferId',
  });

  const nextOfferId = nextOfferIdData as bigint | undefined;

  const getMyRentals = useCallback(async (): Promise<Offer[]> => {
    if (!address || !nextOfferId) return [];
    return [];
  }, [address, nextOfferId]);

  return {
    acceptOffer,
    isAccepting: acceptMutation.isPending,
    acceptError: acceptMutation.error,
    isAcceptSuccess: acceptMutation.isSuccess,
    renewRental,
    isRenewing: renewMutation.isPending,
    renewError: renewMutation.error,
    isRenewSuccess: renewMutation.isSuccess,
    returnToMarket,
    isReturning: returnMutation.isPending,
    returnError: returnMutation.error,
    isReturnSuccess: returnMutation.isSuccess,
    claimPayout,
    isClaiming: claimMutation.isPending,
    claimError: claimMutation.error,
    isClaimSuccess: claimMutation.isSuccess,
    cancelRent,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error,
    isCancelSuccess: cancelMutation.isSuccess,
    nextOfferId,
    getMyRentals,
  };
}

export function useRental(offerId: bigint | undefined) {
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

  const rental: Offer | undefined = typedData ? {
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
    rental,
    isLoading,
    error,
    refetch,
  };
}

export function useActiveDispute(offerId: bigint | undefined) {
  const { 
    data: offerData, 
    isLoading: isOfferLoading, 
    error: offerError, 
    refetch: refetchOffer 
  } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'offers',
    args: offerId !== undefined ? [offerId] : undefined,
    query: {
      enabled: offerId !== undefined,
    },
  });

  const typedOfferData = offerData as readonly [
    bigint, `0x${string}`, `0x${string}`, string, bigint, bigint, bigint, bigint, bigint, bigint, number, bigint, number, number, bigint
  ] | undefined;

  const activeDisputeId = typedOfferData ? typedOfferData[14] : undefined;

  const { 
    data: disputeData, 
    isLoading: isDisputeLoading, 
    error: disputeError, 
    refetch: refetchDispute 
  } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'disputes',
    args: activeDisputeId !== undefined && activeDisputeId !== 0n ? [activeDisputeId] : undefined,
    query: {
      enabled: activeDisputeId !== undefined && activeDisputeId !== 0n,
    },
  });

  const typedDisputeData = disputeData as readonly [
    bigint, bigint, `0x${string}`, `0x${string}`, `0x${string}`, bigint, number, bigint, bigint
  ] | undefined;

  const dispute: Dispute | undefined = typedDisputeData ? {
    disputeId: typedDisputeData[0],
    offerId: typedDisputeData[1],
    renter: typedDisputeData[2],
    renterSignedRequest: typedDisputeData[3],
    expectedPayload: typedDisputeData[4],
    deadline: typedDisputeData[5],
    status: typedDisputeData[6] as 0 | 1 | 2 | 3,
    createdAt: typedDisputeData[7],
    disputeDeposit: typedDisputeData[8],
  } : undefined;

  return {
    dispute,
    activeDisputeId,
    isLoading: isOfferLoading || isDisputeLoading,
    error: offerError || disputeError,
    refetch: async () => {
      await refetchOffer();
      await refetchDispute();
    },
  };
}

export function useContractConstants() {
  const { data: minDeposit } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'MIN_DEPOSIT',
  });

  const { data: minWeeklyPayment } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'MIN_WEEKLY_PAYMENT',
  });

  const { data: gracePeriod } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'GRACE_PERIOD',
  });

  const { data: disputeTimeout } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'DISPUTE_TIMEOUT',
  });

  const { data: offencePenaltyPercentage } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'OFFENCE_PENALTY_PERCENTAGE',
  });

  const { data: basisPoints } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'BASIS_POINTS',
  });

  const { data: rentalDuration } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'RENTAL_DURATION',
  });

  const { data: maxOffences } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'MAX_OFFENCES',
  });

  const { data: maxInvalidDisputes } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'MAX_INVALID_DISPUTES',
  });

  return {
    minDeposit: minDeposit as bigint | undefined,
    minWeeklyPayment: minWeeklyPayment as bigint | undefined,
    gracePeriod: gracePeriod as bigint | undefined,
    disputeTimeout: disputeTimeout as bigint | undefined,
    offencePenaltyPercentage: offencePenaltyPercentage as bigint | undefined,
    basisPoints: basisPoints as bigint | undefined,
    rentalDuration: rentalDuration as bigint | undefined,
    maxOffences: maxOffences as bigint | undefined,
    maxInvalidDisputes: maxInvalidDisputes as bigint | undefined,
  };
}
