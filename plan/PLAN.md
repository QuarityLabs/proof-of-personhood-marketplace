# Proof of Personhood Marketplace - Implementation Plan

**Version:** 2.0.0  
**Status:** Draft (Protocol v2.0 - Dispute-Based System)  
**Date:** 2026-01-30  
**Protocol Version:** 2.0.0 (Dispute-based off-chain communication)

---

## Executive Summary

This plan implements the Proof of Personhood Marketplace Protocol v2.0 across three workspaces: Contracts (Solidity/Foundry), Web (React/Vite/Win95 theme), and Mobile (React Native).

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

## Milestone 1: Protocol-Compliant Smart Contract

**Goal:** Implement marketplace protocol v2.0 with dispute-based conflict resolution.

### 1.1 Redesign Data Structures

**Task ID:** m1-task-1  
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
**Scope:** All protocol events

**Events:**
- OfferCreated, OfferAccepted, RentalRenewed, OfferExpired
- OfferReturnedToMarket, OfferRemoved, PayoutClaimed
- OfferTermsUpdated, DisputeSubmitted, SignatureSubmitted
- ACKSubmitted, DisputeResolved, OffenceCounted, RentCancelled

---

### 1.5 Comprehensive Test Suite

**Task ID:** m1-task-5  
**Scope:** Full test coverage

**Test Categories:**
- State transitions
- Access control
- Economic security
- Dispute resolution
- Edge cases

---

### 1.6 Deployment Script Update

**Task ID:** m1-task-6  
**Scope:** Update deployment script for new contract

---

## Appendix A: Complete Task Index

| Task ID | Milestone | Title | Status |
|---------|-----------|-------|--------|
| m1-task-1 | 1 | Redesign Data Structures | Complete |
| m1-task-2 | 1 | Implement Core Functions | Complete |
| m1-task-3 | 1 | Implement Dispute System | Complete |
| m1-task-4 | 1 | Implement Core Events | Complete |
| m1-task-5 | 1 | Comprehensive Test Suite | Complete |
| m1-task-6 | 1 | Deployment Script Update | Complete |

---

## Appendix B: Protocol Compliance Checklist

### Core Functions
- [ ] createOffer - m1-task-2
- [ ] acceptOffer - m1-task-2
- [ ] renewRental - m1-task-2
- [ ] returnToMarket - m1-task-2
- [ ] removeExpiredOffer - m1-task-2
- [ ] claimPayout - m1-task-2
- [ ] updateOfferTerms - m1-task-2

### Dispute Functions
- [ ] submitDispute - m1-task-3
- [ ] submitSignature - m1-task-3
- [ ] submitRenterACK - m1-task-3
- [ ] resolveDisputeTimeout - m1-task-3
- [ ] cancelRent - m1-task-3

### Data Structures
- [ ] Offer struct with all fields - m1-task-1
- [ ] Dispute struct - m1-task-1
- [ ] OfferStatus enum - m1-task-1
- [ ] DisputeStatus enum - m1-task-1

### Events
- [ ] OfferCreated, OfferAccepted, RentalRenewed, OfferExpired - m1-task-4
- [ ] OfferReturnedToMarket, OfferRemoved, PayoutClaimed - m1-task-4
- [ ] OfferTermsUpdated - m1-task-4
- [ ] DisputeSubmitted, SignatureSubmitted, ACKSubmitted - m1-task-4
- [ ] DisputeResolved, OffenceCounted, RentCancelled - m1-task-4
