# Proof of Personhood Marketplace Protocol

**Version:** 1.0.0
**Status:** Draft
**Date:** 2026-01-30
**Network:** Polkadot Asset Hub (EVM Compatible)

---

## 1. Overview

The Proof of Personhood Marketplace enables **anonymous lending of blockchain identity context**. Identity providers can list their addresses for temporary "rental," while borrowers can pay to use these identities for specific purposes, verified on-chain.

### Key Design Principles

- **Privacy-preserving:** Offers are anonymous; no KYC or personal data required
- **Verifiable:** Signature-based proof of address control (off-chain verification)
- **Time-bound:** All agreements have defined expiration windows
- **Economic security:** Deposits and prepayments prevent abuse

---

## 2. Core Concepts

### 2.1 Identity Offer

An **Identity Offer** represents a blockchain address available for temporary use. It contains:

| Field | Size | Description |
|-------|------|-------------|
| `usage_context` | 32 bytes | Context hash (e.g., application, service identifier) |
| `address_to_rent` | 32 bytes | The blockchain address being offered |
| `weekly_payment` | uint256 | Price per week in native tokens |
| `signature` | 64 bytes | ECDSA signature proving address control |
| `submitter` | address | The party who created the offer |

**Note:** The signature format signs the concatenation:
`context || address_to_rent || payment || off_chain_info (32 bytes)`

The contract stores but does not verify signatures. Off-chain services (mobile app) perform signature verification before allowing identity usage.

### 2.2 Offer Lifecycle States

```
PENDING ──► ACTIVE ──► EXPIRED ──► REMOVED
    │         │          │
    │         ▼          ▼
    │     RENEWAL    GRACE PERIOD (1 week)
    │                   │
    ▼                   ▼
UPDATED           DEPOSIT CLAIMED
```

| State | Description |
|-------|-------------|
| **PENDING** | Offer created, awaiting first renter |
| **ACTIVE** | Renter paid; identity in use; has expiration timestamp |
| **EXPIRED** | Renter did not renew; grace period begins |
| **REMOVED** | Grace period passed; offer removed; deposit available |

---

## 3. Protocol Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `MIN_DEPOSIT` | uint256 | Required deposit to create an offer (anti-spam) |
| `GRACE_PERIOD` | uint256 | Time after expiry before removal (1 week) |
| `SIGNATURE_PAYLOAD_SIZE` | constant | 128 bytes (context + address + payment + off_chain_info) |

---
## 4. Core Functions

### 4.1 Create Offer

```solidity
function createOffer(
    bytes32 usageContext,
    bytes32 addressToRent,
    uint256 weeklyPayment,
    bytes calldata signature  // 64 bytes
) external payable returns (uint256 offerId);
```

**Requirements:**
- `msg.value >= MIN_DEPOSIT`
- `usageContext != bytes32(0)`
- `addressToRent != bytes32(0)`
- `weeklyPayment > 0`
- `signature.length == 64`

**Effects:**
- Creates new offer in PENDING state
- Assigns unique `offerId`
- Locks deposit in contract

---
### 4.2 Accept Offer

```solidity
function acceptOffer(uint256 offerId) external payable;
```

**Requirements:**
- Offer state is PENDING
- `msg.value >= offer.weeklyPayment`
- Caller is not the submitter

**Effects:**
- Transitions offer to ACTIVE
- Sets `renter = msg.sender`
- Sets `expiresAt = block.timestamp + 1 week`
- Stores prepayment

---
### 4.3 Renew Rental

```solidity
function renewRental(uint256 offerId) external payable;
```

**Requirements:**
- Offer state is ACTIVE
- Caller is current `renter`
- `msg.value >= offer.weeklyPayment`
- Called before or within grace period after expiry

**Effects:**
- Extends `expiresAt` by 1 week
- If expired, transitions back to ACTIVE

---
### 4.4 Return to Market

```solidity
function returnToMarket(uint256 offerId) external;
```

**Requirements:**
- Offer state is EXPIRED (grace period active)
- Caller can be anyone

**Effects:**
- Transitions offer back to PENDING
- Clears `renter` field
- Previous renter access revoked

---
### 4.5 Remove Expired Offer

```solidity
function removeExpiredOffer(uint256 offerId) external;
```

**Requirements:**
- Offer state is EXPIRED
- `block.timestamp > offer.expiresAt + GRACE_PERIOD`
- Caller can be anyone

**Effects:**
- Transitions offer to REMOVED
- Emits event for deposit claim eligibility

---
### 4.6 Claim Deposit

```solidity
function claimDeposit(uint256 offerId) external;
```

**Requirements:**
- Offer state is PENDING (never activated) OR REMOVED
- Caller is original `submitter`

**Effects:**
- Returns locked deposit to submitter
- Deletes offer from storage (or marks permanently closed)

---
### 4.7 Update Offer Terms

```solidity
function updateOfferTerms(
    uint256 offerId,
    uint256 newWeeklyPayment
) external;
```

**Requirements:**
- Caller is original `submitter`
- If ACTIVE: only affects next renewal period
- If PENDING: can fully update or withdraw (by setting `newWeeklyPayment = MAX_UINT`)

**Effects:**
- Updates `weeklyPayment` for future periods
- For PENDING offers: can effectively withdraw by setting extreme price
- Does not affect current active rental terms

---
## 5. Data Structures

### 5.1 Offer Struct

```solidity
struct Offer {
    // Identity metadata
    bytes32 usageContext;      // 32 bytes - application context
    bytes32 addressToRent;     // 32 bytes - the address being rented
    bytes signature;           // 64 bytes - proof of control
    
    // Economic terms
    uint256 weeklyPayment;     // Current weekly rate
    uint256 deposit;           // Locked collateral
    
    // State management
    address submitter;         // Original offer creator
    address renter;            // Current user (0x0 if PENDING)
    uint256 expiresAt;         // Expiration timestamp (0 if PENDING)
    OfferStatus status;        // PENDING | ACTIVE | EXPIRED | REMOVED
}

enum OfferStatus {
    PENDING,    // 0 - awaiting first renter
    ACTIVE,     // 1 - currently rented
    EXPIRED,    // 2 - grace period active
    REMOVED     // 3 - can claim deposit
}
```

---
### 5.2 Storage Layout

```solidity
// Global offer counter
uint256 public nextOfferId;

// Primary storage: offerId => Offer
mapping(uint256 => Offer) public offers;

// Index for efficient querying (optional)
mapping(address => uint256[]) public submitterOffers;
mapping(address => uint256[]) public renterOffers;

// Protocol parameters
uint256 public minDeposit;
uint256 public constant GRACE_PERIOD = 7 days;
```

---
## 6. Events

```solidity
event OfferCreated(
    uint256 indexed offerId,
    address indexed submitter,
    bytes32 usageContext,
    bytes32 addressToRent,
    uint256 weeklyPayment,
    uint256 deposit
);

event OfferAccepted(
    uint256 indexed offerId,
    address indexed renter,
    uint256 expiresAt,
    uint256 payment
);

event RentalRenewed(
    uint256 indexed offerId,
    address indexed renter,
    uint256 newExpiresAt,
    uint256 payment
);

event OfferExpired(
    uint256 indexed offerId,
    uint256 expiredAt
);

event OfferReturnedToMarket(
    uint256 indexed offerId,
    address indexed returnedBy
);

event OfferRemoved(
    uint256 indexed offerId,
    address indexed removedBy
);

event DepositClaimed(
    uint256 indexed offerId,
    address indexed submitter,
    uint256 amount
);

event OfferTermsUpdated(
    uint256 indexed offerId,
    uint256 oldPayment,
    uint256 newPayment
);
```

---
## 7. State Transitions

| From | To | Trigger | Who |
|------|----|---------|-----|
| PENDING | ACTIVE | `acceptOffer` | Any (not submitter) |
| ACTIVE | EXPIRED | Time elapsed | Automatic |
| EXPIRED | PENDING | `returnToMarket` | Any |
| EXPIRED | REMOVED | `removeExpiredOffer` | Any (after grace period) |
| PENDING | (deleted) | `claimDeposit` | Submitter |
| REMOVED | (deleted) | `claimDeposit` | Submitter |

---
## 8. Security Considerations

### 8.1 Signature Verification

The contract intentionally **does NOT verify ECDSA signatures on-chain**. This design decision:
- Reduces gas costs for offer creation
- Allows flexibility in signature schemes
- Delegates verification to off-chain services (mobile app)

**Security Model:**
1. Submitter creates offer with signature
2. Mobile app verifies signature before lending identity
3. Contract enforces economic incentives (deposits, payments)

### 8.2 Economic Security

| Mechanism | Purpose |
|-----------|---------|
| **MIN_DEPOSIT** | Anti-spam; ensures submitter has skin in the game |
| **Prepayment (1 week)** | Ensures renter commits to payment |
| **Grace Period** | Allows submitter to reclaim if renter abandons |
| **Open removal** | Incentivizes cleanup of stale offers |

### 8.3 Access Control

| Action | Authorized Caller |
|--------|-------------------|
| Create offer | Any (with deposit) |
| Accept offer | Any (not submitter) |
| Renew rental | Current renter only |
| Return to market | Any (permissionless) |
| Remove expired | Any (after grace period) |
| Claim deposit | Original submitter only |
| Update terms | Original submitter only |

---
## 9. Integration Guide

### 9.1 For Mobile App

1. **Query active offers:** Filter by `status = ACTIVE` and `expiresAt > block.timestamp`
2. **Verify signatures:** Before showing identity to counterparty, verify the stored signature against the address
3. **Check authorization:** Confirm renter has paid for current period

### 9.2 For Web Dashboard

1. **Browse offers:** Query all PENDING offers with pagination
2. **Accept flow:** Call `acceptOffer{value: payment}`
3. **Manage rentals:** Track `expiresAt` and call `renewRental` before expiry

### 9.3 For Identity Providers (Submitters)

1. **Create offer:** Generate signature offline, call `createOffer{value: deposit}`
2. **Update pricing:** Call `updateOfferTerms` to adjust weekly rate
3. **Withdraw:** Set price to MAX or wait for removal, then `claimDeposit`

---
## 10. Improvement Suggestions

Based on the initial design, the following enhancements are recommended:

### 10.1 Batch Operations

Consider adding batch functions for gas efficiency:
```solidity
function batchClaimDeposits(uint256[] calldata offerIds) external;
```

### 10.2 Partial Withdrawals

Allow submitters to reduce deposit (but maintain MIN_DEPOSIT):
```solidity
function reduceDeposit(uint256 offerId, uint256 newDeposit) external;
```

### 10.3 Rental Extensions

Allow renters to prepay multiple weeks upfront:
```solidity
function renewRental(uint256 offerId, uint256 weeksToAdd) external payable;
```

### 10.4 Offer Metadata

Consider adding an optional `metadataURI` field for off-chain offer descriptions:
```solidity
string metadataURI;  // IPFS or HTTPS link to offer details
```

### 10.5 Dispute Resolution

For future versions, consider a dispute mechanism if identity usage is contested:
- Multi-sig arbitration
- Staked dispute bonds
- Time-locked resolution

---

## 11. Testing Checklist

Comprehensive test coverage is critical for this protocol. Key test scenarios:

### 11.1 State Transitions
- PENDING to ACTIVE acceptance flow
- ACTIVE to EXPIRED timing verification
- EXPIRED to PENDING return flow
- EXPIRED to REMOVED after grace period

### 11.2 Access Control
- Only submitter can update terms
- Only renter can renew
- Only submitter can claim deposit
- Permissionless removal after grace period

### 11.3 Economic Security
- Deposit locking and release
- Payment validation and forwarding
- Grace period timing enforcement

### 11.4 Edge Cases
- Attempting to accept already active offer
- Renewing exactly at expiry boundary
- Update terms during active rental
- Multiple rapid renewals

---

## Appendix: Gas Optimization Notes

| Optimization | Implementation |
|--------------|----------------|
| Pack struct fields | Group bytes32 fields together |
| Use uint8 for status | Store enum in smallest uint |
| Indexed events | Index offerId and addresses |
| Reentrancy guard | Use Checks-Effects-Interactions pattern |
