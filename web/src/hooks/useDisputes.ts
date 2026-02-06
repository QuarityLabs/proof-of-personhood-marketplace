import { useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
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

  const getMyDisputes = useCallback(async (): Promise<Dispute[]> => {
    if (!address) return [];
    return [];
  }, [address]);

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
    getMyDisputes,
    getOfferDispute,
  };
}

export function useContractConstants() {
  return {
    minDeposit: undefined as bigint | undefined,
    minWeeklyPayment: undefined as bigint | undefined,
    disputeTimeout: undefined as bigint | undefined,
    maxOffences: undefined as bigint | undefined,
  };
}
