# Proof of Personhood Marketplace - Implementation Plan

**Version:** 2.0.1  
**Status:** Active (Protocol v2.0 - Smart Contracts Complete, Frontend Pending)  
**Date:** 2026-02-02  
**Protocol Version:** 2.0.0 (Dispute-based off-chain communication)

---

## Executive Summary

This plan implements the Proof of Personhood Marketplace Protocol v2.0 across three workspaces: Contracts (Solidity/Foundry), Web (React/Vite/Win95 theme), and Mobile (React Native).

### Current Implementation Status

| Workspace | Status | Completion |
|-----------|--------|------------|
| **Contracts** | ✅ Complete | 100% - All Milestone 1 tasks done |
| **Web** | 🟡 Skeleton | ~10% - Win95 theme only, no marketplace functionality |
| **Mobile** | 🟡 Skeleton | ~5% - Basic React Native app, no features |

### Key Architecture Decisions (v2.0)

1. **Web Dashboard** (Win95 Theme): Full marketplace interface for browsing offers, managing rentals, and creating offers.

2. **Mobile App**: Acts as a secure signer. Stores private keys, scans QR codes for signatures.

3. **Off-Chain First Communication**: By default, all sign-requests happen off-chain directly between renter and lender. On-chain is only used as a dispute resolution fallback.

4. **Dispute-Based System**: When the lender does not respond off-chain, the renter submits a dispute on-chain with a deposit.

5. **Offence-Based Penalties**: Each offence reduces the lender payout by 50% exponentially (100% -> 50% -> 25% -> 12.5%).

6. **Reputation for Both Parties**: 
   - Lender: offences reduce payout
   - Renter: invalid disputes (proven false by lender) count against them

---

## Protocol v2.0 Specification

### Core Principle

Off-chain communication is the default, on-chain is only for dispute resolution.

### Communication Flow (Normal Case - Off-Chain)

1. **Renter sends Sign-Request** (off-chain, signed by renter)
   - Contains: offerId, requestId, timestamp, expected payload

2. **Lender responds with Signature** (off-chain)
   - Signs the requested payload, returns to renter

3. **Renter sends ACK** (off-chain, signed by renter)
   - Acknowledges receipt before next request

### Dispute Flow (Edge Case - On-Chain)

**When lender does not respond off-chain:**

1. **Renter submits Dispute** (on-chain, pays deposit)
   - Provides signed request, timeout proof
   - Only one active dispute per rental

2. **Lender Response Window** (2 hours)
   - Submit signature on-chain, OR
   - Submit renter ACK to prove renter is lying

3. **Resolution:**
   - Lender responds: Dispute resolved, renter loses deposit
   - Lender submits ACK: Renter offence counted, renter loses deposit
   - Timeout: Lender offence counted

### Offence System

**Lender offences:** (timeout on dispute response)
- 0 offences: 100% payout
- 1 offence: 50% payout
- 2 offences: 25% payout
- 3 offences: 12.5% payout
- After 3 offences: Renter can cancel rent and reclaim payment

**Renter offences:** (invalid disputes proven by ACK)
- After 3 invalid disputes: Contract cancelled for both parties

### Payment Model

- Weekly payments locked until lease ends
- Lender withdraws at end (minus penalties)
- Deposit goes to protocol treasury on cancellation

---

## Milestone 1: Protocol-Compliant Smart Contract ✅ COMPLETE

**Status:** All tasks completed and merged to main  
**Goal:** Implement marketplace protocol v2.0 with dispute-based conflict resolution.

### 1.1 Redesign Data Structures

**Task ID:** m1-task-1  
**Status:** ✅ Complete (PR #8)  
**Scope:** Define structs, enums, storage for protocol v2.0

**Deliverables:**

**Enums:**
- OfferStatus (PENDING, ACTIVE, EXPIRED, REMOVED)
- DisputeStatus (PENDING, RESOLVED_SIGNATURE, RESOLVED_ACK, TIMEOUT)

**Structs:**
- Offer: id, submitter, renter, context, weeklyPayment, deposit, lockedPayment, timestamps, status, offences counters, activeDisputeId
- Dispute: id, offerId, renterSignedRequest, expectedPayload, deadline, status

**Storage:**
- Mappings for offers, disputes
- Protocol parameters: minDeposit, DISPUTE_TIMEOUT, OFFENCE_PENALTY
- Protocol treasury address

---

### 1.2 Implement Core Functions

**Task ID:** m1-task-2  
**Status:** ✅ Complete (PR #9)  
**Scope:** 7 core protocol functions

**Functions:**
1. createOffer - Create new offer in PENDING state
2. acceptOffer - Transition PENDING to ACTIVE, lock weekly payment
3. renewRental - Extend ACTIVE offer by 1 week
4. returnToMarket - Transition EXPIRED to PENDING
5. removeExpiredOffer - Transition EXPIRED to REMOVED
6. claimPayout - Lender claims payout at lease end (minus penalties)
7. updateOfferTerms - Modify weekly payment

---

### 1.3 Implement Dispute System

**Task ID:** m1-task-3  
**Status:** ✅ Complete (Part of PR #9, #11)  
**Scope:** Dispute mechanism for off-chain communication failures

**Functions:**
1. submitDispute - Renter submits dispute with deposit
2. submitSignature - Lender submits signature on-chain
3. submitRenterACK - Lender submits ACK to prove renter lying
4. resolveDisputeTimeout - Anyone can call after 2h timeout
5. cancelRent - Renter cancels after 3 lender offences

**Events:**
- DisputeSubmitted, SignatureSubmitted, ACKSubmitted
- DisputeResolved, OffenceCounted
- RentCancelled

---

### 1.4 Implement Core Events

**Task ID:** m1-task-4  
**Status:** ✅ Complete (Part of PR #9)  
**Scope:** All protocol events

**Events:**
- OfferCreated, OfferAccepted, RentalRenewed, OfferExpired
- OfferReturnedToMarket, OfferRemoved, PayoutClaimed
- OfferTermsUpdated, DisputeSubmitted, SignatureSubmitted
- ACKSubmitted, DisputeResolved, OffenceCounted, RentCancelled

---

### 1.5 Comprehensive Test Suite

**Task ID:** m1-task-5  
**Status:** ✅ Complete (PR #12)  
**Scope:** Full test coverage

**Test Categories:**
- State transitions
- Access control
- Economic security
- Dispute resolution
- Edge cases

**Results:** 25 tests passing, covering:
- Enum value verification
- Struct instantiation
- All 7 core functions
- Complete dispute flow
- Edge cases and security

---

### 1.6 Deployment Script Update

**Task ID:** m1-task-6  
**Status:** ✅ Complete (Part of PR #8)  
**Scope:** Update deployment script for new contract

**Deliverables:**
- `script/PersonhoodLending.s.sol` - Foundry deployment script

---

## Current State: Minimal Frontend Implementations

### Web Workspace (React/Vite)

**Current Implementation:**
- **Status:** Skeleton only (~10% complete)
- **Location:** `web/src/App.tsx`
- **Features:** Win95-themed UI with styled-components, basic wallet connection placeholder
- **Missing:**
  - Offer browsing interface
  - Offer creation form
  - Rental management dashboard
  - Contract integration (wagmi/viem)
  - Dispute UI

**File Structure:**
```text
web/src/
├── App.tsx          # Win95-themed skeleton (93 lines)
├── main.tsx         # Entry point
├── __tests__/       # Vitest tests (minimal)
└── vite-env.d.ts    # Vite types
```

**README References Unimplemented:**
- `src/components/` - Not created
- `src/pages/` - Not created
- `src/services/` - Not created

---

### Mobile Workspace (React Native)

**Current Implementation:**
- **Status:** Skeleton only (~5% complete)
- **Location:** `mobile/src/App.tsx`
- **Features:** Basic React Native app structure, placeholder text
- **Missing:**
  - Wallet integration
  - QR code scanner
  - Signer functionality
  - Context portfolio management
  - iOS/Android native directories

**File Structure:**
```text
mobile/src/
├── App.tsx          # Basic RN skeleton (43 lines)
└── __tests__/       # Jest tests (minimal)
```

**README References Unimplemented:**
- `src/components/` - Not created
- `src/screens/` - Not created
- `src/navigation/` - Not created
- `src/services/` - Not created
- `ios/` - Not initialized
- `android/` - Not initialized

---

## Appendix A: Complete Task Index

| Task ID | Milestone | Title | Status | PR |
|---------|-----------|-------|--------|-----|
| m1-task-1 | 1 | Redesign Data Structures | ✅ Complete | #8 |
| m1-task-2 | 1 | Implement Core Functions | ✅ Complete | #9 |
| m1-task-3 | 1 | Implement Dispute System | ✅ Complete | #9, #11 |
| m1-task-4 | 1 | Implement Core Events | ✅ Complete | #9 |
| m1-task-5 | 1 | Comprehensive Test Suite | ✅ Complete | #12 |
| m1-task-6 | 1 | Deployment Script Update | ✅ Complete | #8 |
| web-impl | 2 | Web Marketplace UI | 🟡 Pending | - |
| mobile-impl | 2 | Mobile Signer App | 🟡 Pending | - |

---

## Appendix B: Protocol Compliance Checklist

### Core Functions
- [x] createOffer - m1-task-2
- [x] acceptOffer - m1-task-2
- [x] renewRental - m1-task-2
- [x] returnToMarket - m1-task-2
- [x] removeExpiredOffer - m1-task-2
- [x] claimPayout - m1-task-2
- [x] updateOfferTerms - m1-task-2

### Dispute Functions
- [x] submitDispute - m1-task-3
- [x] submitSignature - m1-task-3
- [x] submitRenterACK - m1-task-3
- [x] resolveDisputeTimeout - m1-task-3
- [x] cancelRent - m1-task-3

### Data Structures
- [x] Offer struct with all fields - m1-task-1
- [x] Dispute struct - m1-task-1
- [x] OfferStatus enum - m1-task-1
- [x] DisputeStatus enum - m1-task-1

### Events
- [x] OfferCreated, OfferAccepted, RentalRenewed, OfferExpired - m1-task-4
- [x] OfferReturnedToMarket, OfferRemoved, PayoutClaimed - m1-task-4
- [x] OfferTermsUpdated - m1-task-4
- [x] DisputeSubmitted, SignatureSubmitted, ACKSubmitted - m1-task-4
- [x] DisputeResolved, OffenceCounted, RentCancelled - m1-task-4
