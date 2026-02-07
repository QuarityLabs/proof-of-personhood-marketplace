import React, { useState } from "react";
import { Window, WindowHeader, WindowContent, Button, ScrollView, Tabs, Tab, TextField } from "react95";
import styled from "styled-components";
import { formatEther as viemFormatEther } from "viem";
import type { Offer, Dispute } from "@/types";
import { OfferStatus, DISPUTE_STATUS_LABELS } from "@/types";

const isValidHex = (value: string): value is `0x${string}` => {
  return /^0x[a-fA-F0-9]+$/.test(value);
};

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  padding: 8px;
`;

const OfferCard = styled(Window)`
  width: 100%;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 11px;
  border-bottom: 1px solid ${({ theme }) => theme.borderDark};
  font-family: "ms_sans_serif";

  &:last-child {
    border-bottom: none;
  }
`;

const ActionButton = styled(Button)`
  margin-top: 8px;
`;

const DisputeForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background: ${({ theme }) => theme.canvas};
  border: 1px solid ${({ theme }) => theme.borderDark};
`;

const Label = styled.label`
  font-size: 11px;
  font-family: "ms_sans_serif";
`;

interface RentalDashboardProps {
  myOffers: Offer[];
  myRentals: Offer[];
  myDisputes: Dispute[];
  onRenew?: (offerId: bigint) => void;
  onReturn?: (offerId: bigint) => void;
  onClaim?: (offerId: bigint) => void;
  onCancel?: (offerId: bigint) => void;
  onSubmitDispute?: (offerId: bigint, signedRequest: `0x${string}`, expectedPayload: `0x${string}`) => void;
  isLoading?: boolean;
}

export const RentalDashboard: React.FC<RentalDashboardProps> = ({
  myOffers,
  myRentals,
  myDisputes,
  onRenew,
  onReturn,
  onClaim,
  onCancel,
  onSubmitDispute,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [disputeOfferId, setDisputeOfferId] = React.useState<bigint | null>(null);
  const [signedRequest, setSignedRequest] = useState("");
  const [expectedPayload, setExpectedPayload] = useState("");

  const formatEther = (value: bigint): string => {
    const etherString = viemFormatEther(value);
    const [whole, decimal = ""] = etherString.split(".");
    const truncatedDecimal = decimal.slice(0, 4).padEnd(4, "0");
    return `${whole}.${truncatedDecimal} ETH`;
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const shortenAddress = (addr: string) => {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "None";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleSubmitDispute = () => {
    if (disputeOfferId && onSubmitDispute && signedRequest && expectedPayload) {
      if (!isValidHex(signedRequest) || !isValidHex(expectedPayload)) {
        alert("Please enter valid hex strings starting with 0x");
        return;
      }
      onSubmitDispute(
        disputeOfferId,
        signedRequest,
        expectedPayload
      );
      setDisputeOfferId(null);
      setSignedRequest("");
      setExpectedPayload("");
    }
  };

  const renderOffers = () => {
    if (myOffers.length === 0) {
      return <p>No offers created yet.</p>;
    }
    return (
      <DashboardGrid>
        {myOffers.map((offer) => (
          <OfferCard key={offer.offerId.toString()}>
            <WindowHeader>Offer #{offer.offerId.toString()}</WindowHeader>
            <WindowContent>
              <DetailRow><span>Status:</span><span>{OfferStatus[offer.status]}</span></DetailRow>
              <DetailRow><span>Context:</span><span>{offer.usageContext}</span></DetailRow>
              <DetailRow><span>Weekly:</span><span>{formatEther(offer.weeklyPayment)}</span></DetailRow>
              <DetailRow><span>Locked:</span><span>{formatEther(offer.lockedPayment)}</span></DetailRow>
              <DetailRow><span>Renter:</span><span>{shortenAddress(offer.renter)}</span></DetailRow>
              <DetailRow><span>Offences:</span><span>{offer.lenderOffences}</span></DetailRow>
              {offer.status === OfferStatus.EXPIRED && offer.lockedPayment > 0n && onClaim && (
                <ActionButton onClick={() => onClaim(offer.offerId)} fullWidth disabled={isLoading}>
                  Claim Payout
                </ActionButton>
              )}
            </WindowContent>
          </OfferCard>
        ))}
      </DashboardGrid>
    );
  };

  const renderRentals = () => {
    if (myRentals.length === 0) {
      return <p>No active rentals.</p>;
    }
    return (
      <DashboardGrid>
        {myRentals.map((rental) => (
          <OfferCard key={rental.offerId.toString()}>
            <WindowHeader>Rental #{rental.offerId.toString()}</WindowHeader>
            <WindowContent>
              <DetailRow><span>Context:</span><span>{rental.usageContext}</span></DetailRow>
              <DetailRow><span>Lender:</span><span>{shortenAddress(rental.submitter)}</span></DetailRow>
              <DetailRow><span>Expires:</span><span>{formatDate(rental.expiresAt)}</span></DetailRow>
              <DetailRow><span>Locked:</span><span>{formatEther(rental.lockedPayment)}</span></DetailRow>
              <DetailRow><span>Offences:</span><span>{rental.lenderOffences}/3</span></DetailRow>
              
              {disputeOfferId === rental.offerId && onSubmitDispute ? (
                <DisputeForm>
                  <Label>Submit Dispute:</Label>
                  <TextField
                    placeholder="Signed Request (0x...)"
                    value={signedRequest}
                    onChange={(e) => setSignedRequest(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    placeholder="Expected Payload (0x...)"
                    value={expectedPayload}
                    onChange={(e) => setExpectedPayload(e.target.value)}
                    fullWidth
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button onClick={handleSubmitDispute} disabled={isLoading || !signedRequest || !expectedPayload}>
                      Submit
                    </Button>
                    <Button onClick={() => setDisputeOfferId(null)}>
                      Cancel
                    </Button>
                  </div>
                </DisputeForm>
              ) : (
                <>
                  {rental.lenderOffences >= 3 && onCancel && (
                    <ActionButton onClick={() => onCancel(rental.offerId)} fullWidth disabled={isLoading}>
                      Cancel and Refund
                    </ActionButton>
                  )}
                  {rental.status === OfferStatus.ACTIVE && onRenew && (
                    <ActionButton onClick={() => onRenew(rental.offerId)} fullWidth disabled={isLoading}>
                      Renew Rental
                    </ActionButton>
                  )}
                  {rental.status === OfferStatus.EXPIRED && onReturn && (
                    <ActionButton onClick={() => onReturn(rental.offerId)} fullWidth disabled={isLoading}>
                      Return to Market
                    </ActionButton>
                  )}
                  {rental.status === OfferStatus.ACTIVE && onSubmitDispute && rental.activeDisputeId === 0n && (
                    <ActionButton onClick={() => setDisputeOfferId(rental.offerId)} fullWidth disabled={isLoading}>
                      Submit Dispute
                    </ActionButton>
                  )}
                  {rental.activeDisputeId !== 0n && (
                    <div style={{ marginTop: "8px", fontSize: "11px", color: "#ff6600" }}>
                      Active Dispute: #{rental.activeDisputeId.toString()}
                    </div>
                  )}
                </>
              )}
            </WindowContent>
          </OfferCard>
        ))}
      </DashboardGrid>
    );
  };

  const renderDisputes = () => {
    if (myDisputes.length === 0) {
      return <p>No disputes.</p>;
    }
    return (
      <DashboardGrid>
        {myDisputes.map((dispute) => (
          <OfferCard key={dispute.disputeId.toString()}>
            <WindowHeader>Dispute #{dispute.disputeId.toString()}</WindowHeader>
            <WindowContent>
              <DetailRow><span>Offer:</span><span>#{dispute.offerId.toString()}</span></DetailRow>
              <DetailRow><span>Status:</span><span>{DISPUTE_STATUS_LABELS[dispute.status]}</span></DetailRow>
              <DetailRow><span>Deadline:</span><span>{formatDate(dispute.deadline)}</span></DetailRow>
              <DetailRow><span>Deposit:</span><span>{formatEther(dispute.disputeDeposit)}</span></DetailRow>
            </WindowContent>
          </OfferCard>
        ))}
      </DashboardGrid>
    );
  };

  return (
    <Window style={{ width: "100%", maxWidth: "900px" }}>
      <WindowHeader>dashboard.exe</WindowHeader>
      <WindowContent>
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as number)}>
          <Tab>My Offers</Tab>
          <Tab>My Rentals</Tab>
          <Tab>Disputes</Tab>
        </Tabs>
        <ScrollView style={{ height: "400px", marginTop: "16px" }}>
          {isLoading ? <p>Loading...</p> : (
            <>
              {activeTab === 0 && renderOffers()}
              {activeTab === 1 && renderRentals()}
              {activeTab === 2 && renderDisputes()}
            </>
          )}
        </ScrollView>
      </WindowContent>
    </Window>
  );
};
