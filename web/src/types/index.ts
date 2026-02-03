export enum OfferStatus {
  PENDING = 0,
  ACTIVE = 1,
  EXPIRED = 2,
  REMOVED = 3,
}

export enum DisputeStatus {
  PENDING = 0,
  RESOLVED_SIGNATURE = 1,
  RESOLVED_ACK = 2,
  TIMEOUT = 3,
}

export interface Offer {
  offerId: bigint;
  submitter: `0x${string}`;
  renter: `0x${string}`;
  usageContext: string;
  weeklyPayment: bigint;
  deposit: bigint;
  lockedPayment: bigint;
  createdAt: bigint;
  rentedAt: bigint;
  expiresAt: bigint;
  status: OfferStatus;
  totalRentals: bigint;
  lenderOffences: number;
  renterInvalidDisputes: number;
  activeDisputeId: bigint;
}

export interface Dispute {
  disputeId: bigint;
  offerId: bigint;
  renter: `0x${string}`;
  renterSignedRequest: `0x${string}`;
  expectedPayload: `0x${string}`;
  deadline: bigint;
  status: DisputeStatus;
  createdAt: bigint;
  disputeDeposit: bigint;
}

export interface CreateOfferParams {
  usageContext: string;
  weeklyPayment: bigint;
  deposit: bigint;
}

export interface SubmitDisputeParams {
  offerId: bigint;
  renterSignedRequest: `0x${string}`;
  expectedPayload: `0x${string}`;
  deposit: bigint;
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  [OfferStatus.PENDING]: 'Available',
  [OfferStatus.ACTIVE]: 'Rented',
  [OfferStatus.EXPIRED]: 'Expired',
  [OfferStatus.REMOVED]: 'Removed',
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  [DisputeStatus.PENDING]: 'Pending',
  [DisputeStatus.RESOLVED_SIGNATURE]: 'Resolved (Signature)',
  [DisputeStatus.RESOLVED_ACK]: 'Resolved (ACK)',
  [DisputeStatus.TIMEOUT]: 'Timeout',
};
