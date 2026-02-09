/**
 * TypeScript types for Proof of Personhood Mobile Signer App
 * Protocol v2.0 - Off-chain communication types
 */

// ============ Offer and Dispute Types (shared with web) ============

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

// ============ Off-Chain Communication Types ============

/**
 * Sign-Request from Renter to Lender (off-chain)
 * The renter sends this to request a signature on a payload
 */
export interface SignRequest {
  offerId: bigint;
  requestId: bigint;
  timestamp: bigint;
  expectedPayload: `0x${string}`;
  renter: `0x${string}`;
  renterSignature?: `0x${string}`; // Signature of the request by renter
}

/**
 * Signature Response from Lender to Renter (off-chain)
 * The lender signs the requested payload
 */
export interface SignatureResponse {
  offerId: bigint;
  requestId: bigint;
  payload: `0x${string}`;
  signature: `0x${string}`;
  timestamp: bigint;
  lender: `0x${string}`;
}

export function toEthereumAddress(address: string): `0x${string}` {
  return (address.startsWith('0x') ? address : `0x${address}`) as `0x${string}`;
}

export function isEthereumAddress(address: string): boolean {
  return address.startsWith('0x') && address.length === 42;
}

/**
 * ACK from Renter to Lender (off-chain)
 * Renter acknowledges receipt of the signature
 */
export interface Ack {
  offerId: bigint;
  requestId: bigint;
  receivedAt: bigint;
  payloadHash: `0x${string}`;
  renter: `0x${string}`;
  renterSignature: `0x${string}`; // Signature of this ACK by renter
}

/**
 * Sign-Request in QR Code format (JSON string)
 */
export interface SignRequestQR {
  type: 'SIGN_REQUEST';
  data: SignRequest;
}

/**
 * Signature Response in QR Code format (JSON string)
 */
export interface SignatureResponseQR {
  type: 'SIGNATURE_RESPONSE';
  data: SignatureResponse;
}

// ============ Wallet Types ============

export interface WalletInfo {
  address: `0x${string}`;
  hasBackup: boolean;
}

export interface CreateWalletParams {
  password: string;
}

export interface ImportWalletParams {
  privateKey: `0x${string}`;
  password: string;
}

// ============ Portfolio Types ============

export interface PortfolioItem {
  offer: Offer;
  earnings: bigint;
  pendingRequests: number;
  offences: number;
}

// ============ UI State Types ============

export type SignRequestState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'parsed'; request: SignRequest }
  | { status: 'signing' }
  | { status: 'success'; response: SignatureResponse }
  | { status: 'error'; error: Error };

export type WalletState =
  | { status: 'uninitialized' }
  | { status: 'initialized'; info: WalletInfo }
  | { status: 'locked' }
  | { status: 'loading' }
  | { status: 'error'; error: Error };

export type PortfolioState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; items: PortfolioItem[] }
  | { status: 'error'; error: Error };

// ============ Validation Errors ============

export class SignRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignRequestError';
  }
}

export class SignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignatureError';
  }
}

export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============ Constants ============

export const SIGN_REQUEST_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
export const REQUEST_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes to respond
export const MAX_QR_DATA_SIZE = 4096; // Maximum QR code data size
