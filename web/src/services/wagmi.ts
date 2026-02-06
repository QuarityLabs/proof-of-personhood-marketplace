import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WC_PROJECT_ID;

const connectors = [injected()];

if (projectId && projectId !== '') {
  connectors.push(walletConnect({ projectId }));
}

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
