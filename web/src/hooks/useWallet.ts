import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = () => {
    const injectedConnector = connectors.find(
      (c) => c.id === 'injected' || c.name?.toLowerCase().includes('metamask')
    );
    if (injectedConnector) {
      connect({ connector: injectedConnector });
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
    connectWallet,
    disconnectWallet,
    shortenAddress,
  };
}
