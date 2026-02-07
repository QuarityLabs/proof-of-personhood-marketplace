import { useWriteContract } from 'wagmi';
import { PERSONHOOD_LENDING_ABI, PERSONHOOD_LENDING_ADDRESS } from '../abi/PersonhoodLending';

export function useContract() {
  const contractConfig = {
    address: PERSONHOOD_LENDING_ADDRESS as `0x${string}`,
    abi: PERSONHOOD_LENDING_ABI,
  };

  return {
    contractConfig,
    address: PERSONHOOD_LENDING_ADDRESS as `0x${string}`,
    abi: PERSONHOOD_LENDING_ABI,
  };
}

export function useContractWrite() {
  const { contractConfig } = useContract();
  const { writeContract, writeContractAsync, isPending, isError, error, isSuccess } = useWriteContract();

  return {
    writeContract,
    writeContractAsync,
    isPending,
    isError,
    error,
    isSuccess,
    contractConfig,
  };
}
