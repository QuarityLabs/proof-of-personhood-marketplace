import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect } from 'react';

export function useWallet() {
  const { address, isConnected, isConnecting, status } = useAccount();
  const { connect, connectors, error: connectError, isPending: isConnectPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Handle connection errors (including user rejections)
  useEffect(() => {
    if (connectError) {
      console.error('Wallet connection error:', connectError);
      
      // Check for user rejection
      const errorName = (connectError as Error)?.name;
      const errorMessage = (connectError as Error)?.message;
      
      if (errorName === 'UserRejectedRequestError' || 
          errorMessage?.toLowerCase().includes('user rejected') ||
          (connectError as { code?: number })?.code === 4001) {
        // User rejected - this is expected behavior, don't show alert
        return;
      }
      
      // Other errors - show alert
      alert(`Failed to connect wallet: ${errorMessage || 'Unknown error'}`);
    }
  }, [connectError]);

  const connectWallet = async () => {
    const ethereum = (window as unknown as { ethereum?: { request: (args: unknown) => Promise<unknown> } }).ethereum;
    if (typeof window === 'undefined' || !ethereum) {
      alert('No Ethereum wallet found. Please install MetaMask or another wallet.');
      return;
    }

    const injectedConnector = connectors.find(
      (c) => c.id === 'injected' || c.name?.toLowerCase().includes('metamask')
    );
    
    if (injectedConnector) {
      try {
        await connect({ connector: injectedConnector });
      } catch (err) {
        // Error is handled by useEffect above
        console.error('Connect threw:', err);
      }
    } else {
      alert('No injected wallet connector found.');
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const shortenAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return {
    address,
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    status,
    connectError,
    connectWallet,
    disconnectWallet,
    shortenAddress,
  };
}
