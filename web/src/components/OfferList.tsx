import React from 'react';
import { Window, WindowHeader, WindowContent, Button, ScrollView } from 'react95';
import styled from 'styled-components';
import type { Offer } from '../types';
import { OfferStatus, OFFER_STATUS_LABELS } from '../types';

const OfferCard = styled(Window)`
  margin-bottom: 16px;
  width: 100%;
`;

const OfferGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 8px;
`;

const OfferDetail = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.borderDark};
  font-family: 'ms_sans_serif';
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ status: OfferStatus }>`
  padding: 2px 8px;
  background: ${({ status, theme }) => {
    switch (status) {
      case OfferStatus.PENDING:
        return theme.material;
      case OfferStatus.ACTIVE:
        return theme.checkerboard;
      case OfferStatus.EXPIRED:
        return theme.headerNotActiveBackground;
      default:
        return theme.canvas;
    }
  }};
  border: 2px solid ${({ theme }) => theme.borderDark};
  font-size: 11px;
`;

interface OfferListProps {
  offers: Offer[];
  onRent?: (offerId: bigint) => void;
  isLoading?: boolean;
}

export const OfferList: React.FC<OfferListProps> = ({ offers, onRent, isLoading }) => {
  const formatEther = (value: bigint) => {
    return `${(Number(value) / 1e18).toFixed(4)} ETH`;
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Window>
        <WindowHeader>offers.exe</WindowHeader>
        <WindowContent>
          <p>Loading offers...</p>
        </WindowContent>
      </Window>
    );
  }

  return (
    <Window style={{ width: '100%', maxWidth: '900px' }}>
      <WindowHeader>offers.exe</WindowHeader>
      <WindowContent>
        <ScrollView style={{ height: '500px' }}>
          <OfferGrid>
            {offers.length === 0 ? (
              <p>No offers available.</p>
            ) : (
              offers.map((offer) => (
                <OfferCard key={offer.offerId.toString()}>
                  <WindowHeader>Offer #{offer.offerId.toString()}</WindowHeader>
                  <WindowContent>
                    <OfferDetail>
                      <span>Status:</span>
                      <StatusBadge status={offer.status}>
                        {OFFER_STATUS_LABELS[offer.status]}
                      </StatusBadge>
                    </OfferDetail>
                    <OfferDetail>
                      <span>Context:</span>
                      <span>{offer.usageContext}</span>
                    </OfferDetail>
                    <OfferDetail>
                      <span>Weekly:</span>
                      <span>{formatEther(offer.weeklyPayment)}</span>
                    </OfferDetail>
                    <OfferDetail>
                      <span>Deposit:</span>
                      <span>{formatEther(offer.deposit)}</span>
                    </OfferDetail>
                    <OfferDetail>
                      <span>Lender:</span>
                      <span>{shortenAddress(offer.submitter)}</span>
                    </OfferDetail>
                    {offer.status === OfferStatus.PENDING && onRent && (
                      <div style={{ marginTop: '12px' }}>
                        <Button onClick={() => onRent(offer.offerId)} fullWidth>
                          Rent Now
                        </Button>
                      </div>
                    )}
                  </WindowContent>
                </OfferCard>
              ))
            )}
          </OfferGrid>
        </ScrollView>
      </WindowContent>
    </Window>
  );
};
