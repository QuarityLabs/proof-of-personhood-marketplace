import React from 'react';
import { Window, WindowHeader, Button, WindowContent } from 'react95';
import styled from 'styled-components';
import { useWallet } from '../hooks/useWallet';

const StyledWindow = styled(Window)`
  width: 300px;
`;

const WalletInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.canvas};
  border: 2px solid ${({ theme }) => theme.borderDark};
  font-family: 'ms_sans_serif';
`;

export const WalletConnect: React.FC = () => {
  const { isConnected, address, connectWallet, disconnectWallet, shortenAddress } = useWallet();

  return (
    <StyledWindow>
      <WindowHeader>wallet.exe</WindowHeader>
      <WindowContent>
        {isConnected && address ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <WalletInfo>
              <span>Connected:</span>
              <strong>{shortenAddress(address)}</strong>
            </WalletInfo>
            <Button onClick={disconnectWallet}>Disconnect</Button>
          </div>
        ) : (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        )}
      </WindowContent>
    </StyledWindow>
  );
};
