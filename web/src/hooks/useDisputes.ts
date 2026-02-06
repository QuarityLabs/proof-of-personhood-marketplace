import { useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { PERSONHOOD_LENDING_ABI, PERSONHOOD_LENDING_ADDRESS } from '../abi/PersonhoodLending';
import type { Dispute } from '../types';

const CONTRACT_CONFIG = {
  address: PERSONHOOD_LENDING_ADDRESS as `0x${string}`,
  abi: PERSONHOOD_LENDING_ABI,
};

export function useDisputes() {
  const { address } = useAccount();
  const { writeContractAsync, isPending, error, isSuccess } = useWriteContract();

  const submitDispute = useCallback(async (
    offerId: bigint,
    renterSignedRequest: `0x${string}`,
    expectedPayload: `0x${string}`,
    disputeDeposit: bigint
  ) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'submitDispute',
      args: [offerId, renterSignedRequest, expectedPayload],
      value: disputeDeposit,
    });
  }, [writeContractAsync]);

  const submitSignature = useCallback(async (
    disputeId: bigint,
    signature: `0x${string}`
  ) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'submitSignature',
      args: [disputeId, signature],
    });
  }, [writeContractAsync]);

  const submitRenterACK = useCallback(async (
    disputeId: bigint,
    renterAck: `0x${string}`
  ) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'submitRenterACK',
      args: [disputeId, renterAck],
    });
  }, [writeContractAsync]);

  const resolveDisputeTimeout = useCallback(async (disputeId: bigint) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: 'resolveDisputeTimeout',
      args: [disputeId],
    });
  }, [writeContractAsync]);

  const { data: nextDisputeIdData } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'nextDisputeId',
  });

  const nextDisputeId = nextDisputeIdData as bigint | undefined;

  const getMyDisputes = useCallback(async (): Promise<Dispute[]> => {
    if (!address || !nextDisputeId) return [];
    return [];
  }, [address, nextDisputeId]);

  const getOfferDispute = useCallback(async (): Promise<Dispute | null> => {
    return null;
  }, []);

  return {
    submitDispute,
    isSubmitting: isPending,
    submitError: error,
    isSubmitSuccess: isSuccess,
    submitSignature,
    isSubmittingSignature: isPending,
    submitRenterACK,
    isSubmittingACK: isPending,
    resolveDisputeTimeout,
    isResolving: isPending,
    nextDisputeId,
    getMyDisputes,
    getOfferDispute,
  };
}

export function useDispute(disputeId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'disputes',
    args: disputeId !== undefined ? [disputeId] : undefined,
    query: {
      enabled: disputeId !== undefined,
    },
  });

  const typedData = data as readonly [
    bigint, bigint, `0x${string}`, `0x${string}`, `0x${string}`, bigint, number, bigint, bigint
  ] | undefined;

  const dispute: Dispute | undefined = typedData ? {
    disputeId: typedData[0],
    offerId: typedData[1],
    renter: typedData[2],
    renterSignedRequest: typedData[3],
    expectedPayload: typedData[4],
    deadline: typedData[5],
    status: typedData[6] as 0 | 1 | 2 | 3,
    createdAt: typedData[7],
    disputeDeposit: typedData[8],
  } : undefined;

  return {
    dispute,
    isLoading,
    error,
    refetch,
  };
}

export function useProtocolTreasury() {
  const { data, isLoading, error, refetch } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'protocolTreasury',
  });

  return {
    protocolTreasury: data as `0x${string}` | undefined,
    isLoading,
    error,
    refetch,
  };
}
