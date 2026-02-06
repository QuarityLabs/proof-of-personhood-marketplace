import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, status } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

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
        console.error('Failed to connect wallet:', err);
        alert('Failed to connect wallet. Please make sure your wallet is unlocked.');
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
    isConnecting,
    status,
    connectError,
    connectWallet,
    disconnectWallet,
    shortenAddress,
  };
}
